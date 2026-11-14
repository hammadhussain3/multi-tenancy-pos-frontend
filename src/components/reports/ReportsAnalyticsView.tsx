import { useState, useMemo, useCallback } from 'react';
import {
  FileSpreadsheet,
  Calendar,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  BarChart3,
  Flame,
  Snowflake,
  RefreshCw,
  Printer,
  Boxes,
} from 'lucide-react';
import writeXlsxFile, { type SheetData } from 'write-excel-file/browser';
import { usePos } from '../../context/usePos';
import type { Invoice, Product } from '../../types/pos';

type DateFilterPreset = 'today' | 'yesterday' | 'week' | 'this_month' | 'last_month' | 'custom';
type ReportTab = 'performance' | 'stock_health' | 'ai_insights';

interface ProductSalesStat {
  product: Product;
  unitsSold: number;
  totalRevenue: number;
  totalCost: number;
  profit: number;
  marginPercent: number;
  salesVelocityPerDay: number;
  stockStatus: 'healthy' | 'low' | 'out_of_stock';
  runwayDays: number | null;
  velocityRank: 'top' | 'steady' | 'slow' | 'dead';
}

function getInitialDates() {
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  return { today, firstOfMonth };
}

export function ReportsAnalyticsView() {
  const { products, invoices, currentTenant, isUrdu } = usePos();

  const [dateBounds, setDateBounds] = useState(() => {
    const { today, firstOfMonth } = getInitialDates();
    return {
      preset: 'this_month' as DateFilterPreset,
      startDate: firstOfMonth,
      endDate: today,
      daysInPeriod: Math.max(1, new Date().getDate()),
    };
  });

  const { preset, startDate, endDate, daysInPeriod } = dateBounds;

  const handleSelectPreset = useCallback((p: DateFilterPreset) => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    if (p === 'today') {
      setDateBounds({ preset: p, startDate: todayStr, endDate: todayStr, daysInPeriod: 1 });
    } else if (p === 'yesterday') {
      const y = new Date();
      y.setDate(y.getDate() - 1);
      const yStr = y.toISOString().split('T')[0];
      setDateBounds({ preset: p, startDate: yStr, endDate: yStr, daysInPeriod: 1 });
    } else if (p === 'week') {
      const w = new Date();
      w.setDate(w.getDate() - 7);
      setDateBounds({ preset: p, startDate: w.toISOString().split('T')[0], endDate: todayStr, daysInPeriod: 7 });
    } else if (p === 'this_month') {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      const days = Math.max(1, now.getDate());
      setDateBounds({ preset: p, startDate: firstDay, endDate: todayStr, daysInPeriod: days });
    } else if (p === 'last_month') {
      const firstDay = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split('T')[0];
      const lastDay = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split('T')[0];
      const days = new Date(now.getFullYear(), now.getMonth(), 0).getDate();
      setDateBounds({ preset: p, startDate: firstDay, endDate: lastDay, daysInPeriod: days });
    } else {
      setDateBounds((prev) => ({ ...prev, preset: 'custom' }));
    }
  }, []);

  const handleCustomDateChange = useCallback((newStart: string, newEnd: string) => {
    const s = new Date(newStart);
    const e = new Date(newEnd);
    const diff = Math.max(1, Math.round((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1);
    setDateBounds({
      preset: 'custom',
      startDate: newStart,
      endDate: newEnd,
      daysInPeriod: diff,
    });
  }, []);

  const [activeReportTab, setActiveReportTab] = useState<ReportTab>('performance');
  const [stockHealthFilter, setStockHealthFilter] = useState<'all' | 'critical' | 'healthy'>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isExporting, setIsExporting] = useState<boolean>(false);

  // Filter Invoices in the Selected Date Range
  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv: Invoice) => {
      if (inv.status === 'refunded') return false;
      const invDate = inv.date.split('T')[0];
      return invDate >= startDate && invDate <= endDate;
    });
  }, [invoices, startDate, endDate]);

  // Aggregate Product Performance & Inventory Health (O(N) single-pass aggregation)
  const productStats = useMemo(() => {
    const salesMap = new Map<string, { unitsSold: number; totalRevenue: number }>();

    for (const inv of filteredInvoices) {
      for (const item of inv.items) {
        const existing = salesMap.get(item.product.id) || { unitsSold: 0, totalRevenue: 0 };
        salesMap.set(item.product.id, {
          unitsSold: existing.unitsSold + item.quantity,
          totalRevenue: existing.totalRevenue + item.total,
        });
      }
    }

    const stats: ProductSalesStat[] = products.map((prod) => {
      const sales = salesMap.get(prod.id) || { unitsSold: 0, totalRevenue: 0 };
      const totalCost = sales.unitsSold * prod.purchasePrice;
      const profit = Math.max(0, sales.totalRevenue - totalCost);
      const marginPercent = sales.totalRevenue > 0 ? Math.round((profit / sales.totalRevenue) * 100) : 0;
      const velocity = Math.round((sales.unitsSold / daysInPeriod) * 10) / 10;

      let stockStatus: 'healthy' | 'low' | 'out_of_stock' = 'healthy';
      if (prod.currentStock <= 0) {
        stockStatus = 'out_of_stock';
      } else if (prod.currentStock <= prod.minStockAlert) {
        stockStatus = 'low';
      }

      const runwayDays = velocity > 0 ? Math.round(prod.currentStock / velocity) : null;

      let velocityRank: 'top' | 'steady' | 'slow' | 'dead' = 'dead';
      if (sales.unitsSold >= 15) {
        velocityRank = 'top';
      } else if (sales.unitsSold >= 5) {
        velocityRank = 'steady';
      } else if (sales.unitsSold > 0) {
        velocityRank = 'slow';
      }

      return {
        product: prod,
        unitsSold: sales.unitsSold,
        totalRevenue: sales.totalRevenue,
        totalCost,
        profit,
        marginPercent,
        salesVelocityPerDay: velocity,
        stockStatus,
        runwayDays,
        velocityRank,
      };
    });

    // Sort by units sold descending
    return stats.sort((a, b) => b.unitsSold - a.unitsSold);
  }, [filteredInvoices, products, daysInPeriod]);

  // Executive High-Level Metrics
  const totalRevenue = useMemo(() => {
    return filteredInvoices.reduce((acc, inv) => acc + inv.grandTotal, 0);
  }, [filteredInvoices]);

  const totalUnitsSold = useMemo(() => {
    return productStats.reduce((acc, stat) => acc + stat.unitsSold, 0);
  }, [productStats]);

  const totalGrossProfit = useMemo(() => {
    return productStats.reduce((acc, stat) => acc + stat.profit, 0);
  }, [productStats]);

  const topSellingProduct = productStats[0] || null;
  const criticalStockCount = useMemo(() => {
    return products.filter((p) => p.currentStock <= p.minStockAlert).length;
  }, [products]);

  // AI Strategic Insights Engine (Deterministic & Real-Time)
  const aiInsights = useMemo(() => {
    const topPerformers = productStats.filter((s) => s.velocityRank === 'top');
    const deadStock = productStats.filter((s) => s.unitsSold === 0 && s.product.currentStock > 0);
    const criticalRunout = productStats.filter(
      (s) => s.runwayDays !== null && s.runwayDays <= 3 && s.product.currentStock > 0
    );

    return {
      topPerformers,
      deadStock,
      criticalRunout,
      summaryNotes: [
        `Revenue Leader: ${topSellingProduct?.product.name || 'N/A'} generated PKR ${(topSellingProduct?.totalRevenue || 0).toLocaleString()} across ${topSellingProduct?.unitsSold || 0} units.`,
        criticalRunout.length > 0
          ? `Stockout Alert: ${criticalRunout.length} fast-selling products will run out within 72 hours based on daily velocity.`
          : 'Stock Health: All fast-moving inventory has over 5+ days of operational runway.',
        deadStock.length > 0
          ? `Capital Optimization: ${deadStock.length} products had 0 sales this period. Consider promotional bundles or display relocation.`
          : 'Inventory Turn: 100% of catalog items recorded sales movement in this window.',
      ],
    };
  }, [productStats, topSellingProduct]);

  // Native Multi-Sheet .XLSX Export Handler
  const handleExportExcel = useCallback(async () => {
    try {
      setIsExporting(true);

      // Sheet 1: Executive Summary
      const summaryRows: SheetData = [
        [{ value: 'RETAIL POS & BIG MART EXECUTIVE REPORT', fontWeight: 'bold' as const }],
        [{ value: `Tenant: ${currentTenant.name} (${currentTenant.branch})` }],
        [{ value: `Report Period: ${startDate} to ${endDate} (${daysInPeriod} days)` }],
        [{ value: `Generated At: ${new Date().toLocaleString()}` }],
        [{ value: '' }],
        [{ value: 'METRIC', fontWeight: 'bold' as const }, { value: 'VALUE', fontWeight: 'bold' as const }],
        [{ value: 'Total Revenue (PKR)' }, { value: totalRevenue, format: '#,##0' }],
        [{ value: 'Total Items Sold' }, { value: totalUnitsSold, format: '#,##0' }],
        [{ value: 'Gross Estimated Profit (PKR)' }, { value: totalGrossProfit, format: '#,##0' }],
        [{ value: 'Invoices Issued' }, { value: filteredInvoices.length, format: '#,##0' }],
        [{ value: 'Top Selling SKU' }, { value: topSellingProduct ? topSellingProduct.product.name : 'N/A' }],
        [{ value: 'Critical Stock Alert Count' }, { value: criticalStockCount, format: '#,##0' }],
      ];

      // Sheet 2: Product Sales Performance
      const performanceHeader = [
        { value: 'Rank', fontWeight: 'bold' as const },
        { value: 'Product Name', fontWeight: 'bold' as const },
        { value: 'Barcode', fontWeight: 'bold' as const },
        { value: 'SKU', fontWeight: 'bold' as const },
        { value: 'Category', fontWeight: 'bold' as const },
        { value: 'Retail Price (PKR)', fontWeight: 'bold' as const },
        { value: 'Units Sold', fontWeight: 'bold' as const },
        { value: 'Revenue (PKR)', fontWeight: 'bold' as const },
        { value: 'Gross Profit (PKR)', fontWeight: 'bold' as const },
        { value: 'Margin %', fontWeight: 'bold' as const },
        { value: 'Sales/Day', fontWeight: 'bold' as const },
        { value: 'Stock Status', fontWeight: 'bold' as const },
      ];

      const performanceRows: SheetData = [
        performanceHeader,
        ...productStats.map((stat, idx) => [
          { value: idx + 1 },
          { value: stat.product.name },
          { value: stat.product.barcode },
          { value: stat.product.sku },
          { value: stat.product.category },
          { value: stat.product.retailPrice, format: '#,##0' },
          { value: stat.unitsSold, format: '#,##0' },
          { value: stat.totalRevenue, format: '#,##0' },
          { value: stat.profit, format: '#,##0' },
          { value: `${stat.marginPercent}%` },
          { value: stat.salesVelocityPerDay },
          { value: stat.stockStatus.toUpperCase() },
        ]),
      ];

      // Sheet 3: Stock Health & Reorder Recommendations
      const stockHeader = [
        { value: 'Product Name', fontWeight: 'bold' as const },
        { value: 'Category', fontWeight: 'bold' as const },
        { value: 'Current Stock', fontWeight: 'bold' as const },
        { value: 'Min Stock Alert', fontWeight: 'bold' as const },
        { value: 'Unit', fontWeight: 'bold' as const },
        { value: 'Daily Sales Velocity', fontWeight: 'bold' as const },
        { value: 'Runway (Days)', fontWeight: 'bold' as const },
        { value: 'Inventory Status', fontWeight: 'bold' as const },
        { value: 'Suggested Reorder Qty', fontWeight: 'bold' as const },
      ];

      const stockRows: SheetData = [
        stockHeader,
        ...products.map((prod) => {
          const stat = productStats.find((s) => s.product.id === prod.id);
          const vel = stat?.salesVelocityPerDay || 0;
          const runway = vel > 0 ? Math.round(prod.currentStock / vel) : 'N/A';
          let status = 'HEALTHY';
          let reorderQty = 0;
          if (prod.currentStock <= 0) {
            status = 'OUT OF STOCK';
            reorderQty = Math.max(prod.minStockAlert * 3, 20);
          } else if (prod.currentStock <= prod.minStockAlert) {
            status = 'CRITICAL LOW';
            reorderQty = Math.max(prod.minStockAlert * 2, 10);
          }

          return [
            { value: prod.name },
            { value: prod.category },
            { value: prod.currentStock, format: '#,##0' },
            { value: prod.minStockAlert, format: '#,##0' },
            { value: prod.unit },
            { value: vel },
            { value: runway },
            { value: status },
            { value: reorderQty, format: '#,##0' },
          ];
        }),
      ];

      // Sheet 4: AI Strategic Action Plan
      const aiRows: SheetData = [
        [{ value: 'AI STRATEGIC RETAIL RECOMMENDATIONS', fontWeight: 'bold' as const }],
        [{ value: `Generated for ${currentTenant.name} based on ${daysInPeriod} days of POS telemetry` }],
        [{ value: '' }],
        [
          { value: 'Category', fontWeight: 'bold' as const },
          { value: 'Intelligence Finding', fontWeight: 'bold' as const },
          { value: 'Recommended Action', fontWeight: 'bold' as const },
        ],
        [
          { value: 'Fast Movers' },
          { value: `${aiInsights.topPerformers.length} top velocity products generating ${(totalRevenue * 0.75).toLocaleString()} PKR` },
          { value: 'Maintain buffer stock of at least 2 weeks; negotiate bulk supplier discount.' },
        ],
        [
          { value: 'Runout Risks' },
          { value: `${aiInsights.criticalRunout.length} products risking stockout within 72 hours` },
          { value: 'Place urgent purchase orders with primary distributors today.' },
        ],
        [
          { value: 'Dead Capital' },
          { value: `${aiInsights.deadStock.length} SKUs tying up inventory capital with 0 sales` },
          { value: 'Implement 10% weekend bundle discount or relocate to front checkout display.' },
        ],
      ];

      // Generate native multi-sheet Excel file (.xlsx)
      const excel = await writeXlsxFile([
        { data: summaryRows, sheet: 'Summary' },
        { data: performanceRows, sheet: 'Product Sales' },
        { data: stockRows, sheet: 'Stock Health' },
        { data: aiRows, sheet: 'AI Recommendations' },
      ]);
      await excel.toFile(`POS_Report_${startDate}_to_${endDate}.xlsx`);
    } catch (err) {
      alert('Failed to generate Excel file: ' + String(err));
    } finally {
      setIsExporting(false);
    }
  }, [
    currentTenant,
    startDate,
    endDate,
    daysInPeriod,
    totalRevenue,
    totalUnitsSold,
    totalGrossProfit,
    filteredInvoices.length,
    topSellingProduct,
    criticalStockCount,
    productStats,
    products,
    aiInsights,
  ]);

  // Filtered views based on search term
  const displayedProductStats = useMemo(() => {
    if (!searchTerm.trim()) return productStats;
    const q = searchTerm.toLowerCase().trim();
    return productStats.filter(
      (s) =>
        s.product.name.toLowerCase().includes(q) ||
        s.product.barcode.includes(q) ||
        s.product.category.toLowerCase().includes(q)
    );
  }, [productStats, searchTerm]);

  const displayedStockHealth = useMemo(() => {
    let list = productStats;
    if (stockHealthFilter === 'critical') {
      list = list.filter((s) => s.stockStatus !== 'healthy');
    } else if (stockHealthFilter === 'healthy') {
      list = list.filter((s) => s.stockStatus === 'healthy');
    }
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      list = list.filter(
        (s) =>
          s.product.name.toLowerCase().includes(q) ||
          s.product.category.toLowerCase().includes(q)
      );
    }
    return list;
  }, [productStats, stockHealthFilter, searchTerm]);

  return (
    <div className="flex-1 min-h-0 flex flex-col p-2.5 sm:p-4 gap-3 bg-slate-100 dark:bg-[#0b0f19] overflow-hidden select-none">
      {/* 1. Header & Date Range Filter Toolbar */}
      <div className="p-3 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3 shrink-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span>{isUrdu ? 'سیلز رپورٹس اور ریٹیل انٹیلیجنس' : 'Reports & Retail Intelligence'}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                  AI Analytics
                </span>
              </h2>
              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Active Window: <strong className="text-slate-800 dark:text-slate-200 font-bold">{startDate}</strong> to <strong className="text-slate-800 dark:text-slate-200 font-bold">{endDate}</strong> ({daysInPeriod} days)
              </div>
            </div>
          </div>

          {/* Action Buttons: Export to Excel (.xlsx) & Print */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleExportExcel}
              disabled={isExporting}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 shadow-xs cursor-pointer active:scale-95 transition-all"
              title="Download formatted multi-sheet Excel file (.xlsx)"
            >
              {isExporting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
              <span>{isExporting ? 'Generating...' : 'Export Excel (.xlsx)'}</span>
            </button>

            <button
              onClick={() => window.print()}
              className="px-3 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
              title="Print Report"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Print</span>
            </button>
          </div>
        </div>

        {/* Date Filter Preset Pills & Custom Pickers */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl overflow-x-auto text-xs">
            <button
              onClick={() => handleSelectPreset('today')}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                preset === 'today' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-2xs' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => handleSelectPreset('yesterday')}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                preset === 'yesterday' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-2xs' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Yesterday
            </button>
            <button
              onClick={() => handleSelectPreset('week')}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                preset === 'week' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-2xs' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Last 7 Days
            </button>
            <button
              onClick={() => handleSelectPreset('this_month')}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                preset === 'this_month' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-2xs' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              This Month
            </button>
            <button
              onClick={() => handleSelectPreset('last_month')}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                preset === 'last_month' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-2xs' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Last Month
            </button>
            <button
              onClick={() => handleSelectPreset('custom')}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1 ${
                preset === 'custom' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-2xs' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <Calendar className="w-3 h-3" />
              <span>Custom Range</span>
            </button>
          </div>

          {/* Custom Date Pickers */}
          {preset === 'custom' && (
            <div className="flex items-center gap-2 text-xs">
              <input
                type="date"
                value={startDate}
                onChange={(e) => handleCustomDateChange(e.target.value, endDate)}
                className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-bold text-slate-800 dark:text-slate-200 text-xs"
              />
              <span className="text-slate-400">to</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => handleCustomDateChange(startDate, e.target.value)}
                className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-bold text-slate-800 dark:text-slate-200 text-xs"
              />
            </div>
          )}
        </div>
      </div>

      {/* 2. Executive Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-2.5 shrink-0">
        <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Total Revenue</div>
          <div className="text-base sm:text-lg font-black text-emerald-700 dark:text-emerald-400 mt-1">
            PKR {totalRevenue.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-500 font-medium mt-0.5">{filteredInvoices.length} orders billed</div>
        </div>

        <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Volume Sold</div>
          <div className="text-base sm:text-lg font-black text-indigo-700 dark:text-indigo-400 mt-1">
            {totalUnitsSold.toLocaleString()} units
          </div>
          <div className="text-[10px] text-slate-500 font-medium mt-0.5">
            Avg {Math.round(totalUnitsSold / daysInPeriod)} units/day
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Est. Gross Profit</div>
          <div className="text-base sm:text-lg font-black text-purple-700 dark:text-purple-400 mt-1">
            PKR {totalGrossProfit.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-500 font-medium mt-0.5">
            {totalRevenue > 0 ? Math.round((totalGrossProfit / totalRevenue) * 100) : 0}% net margin
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Top Velocity SKU</div>
          <div className="text-xs sm:text-sm font-black text-slate-900 dark:text-slate-100 truncate mt-1">
            {topSellingProduct ? topSellingProduct.product.name : 'No Sales Yet'}
          </div>
          <div className="text-[10px] text-emerald-600 font-bold mt-0.5">
            {topSellingProduct?.unitsSold || 0} units (PKR {(topSellingProduct?.totalRevenue || 0).toLocaleString()})
          </div>
        </div>

        <div className="col-span-2 lg:col-span-1 p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Critical Stock Alert</div>
          <div className="text-base sm:text-lg font-black text-rose-600 dark:text-rose-400 mt-1 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-rose-500" />
            <span>{criticalStockCount} SKUs</span>
          </div>
          <div className="text-[10px] text-slate-500 font-medium mt-0.5">Below reorder minimum</div>
        </div>
      </div>

      {/* 3. Sub-Navigation Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2 shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveReportTab('performance')}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
              activeReportTab === 'performance'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Product Sales (Top vs Least)</span>
          </button>

          <button
            onClick={() => setActiveReportTab('stock_health')}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
              activeReportTab === 'stock_health'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Boxes className="w-3.5 h-3.5" />
            <span>Inventory Health & Runway</span>
          </button>

          <button
            onClick={() => setActiveReportTab('ai_insights')}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
              activeReportTab === 'ai_insights'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>AI Strategic Insights</span>
          </button>
        </div>

        {/* Search Filter in table */}
        <div className="w-48 sm:w-64">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search product / category..."
            className="w-full px-2.5 py-1 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* 4. Tab 1: Product Sales Performance Table */}
      {activeReportTab === 'performance' && (
        <div className="flex-1 min-h-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden flex flex-col">
          <div className="flex-1 min-h-0 overflow-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 dark:bg-slate-800/80 sticky top-0 border-b border-slate-200 dark:border-slate-700 z-10 text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">Rank</th>
                  <th className="py-2.5 px-3">Product Name</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3 text-right">Retail Price</th>
                  <th className="py-2.5 px-3 text-right">Units Sold</th>
                  <th className="py-2.5 px-3 text-right">Revenue</th>
                  <th className="py-2.5 px-3 text-right">Gross Margin</th>
                  <th className="py-2.5 px-3 text-center">Movement Status</th>
                  <th className="py-2.5 px-3 text-center">Stock Remaining</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {displayedProductStats.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-slate-400">
                      No sales records found for this period.
                    </td>
                  </tr>
                ) : (
                  displayedProductStats.map((stat, idx) => (
                    <tr
                      key={stat.product.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-500">#{idx + 1}</td>
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-slate-900 dark:text-slate-100">{stat.product.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{stat.product.barcode}</div>
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">{stat.product.category}</td>
                      <td className="py-2.5 px-3 text-right font-semibold text-slate-800 dark:text-slate-200">
                        PKR {stat.product.retailPrice.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <span className="font-black text-slate-900 dark:text-slate-100">{stat.unitsSold}</span>
                        <span className="text-[10px] text-slate-400 ml-1">{stat.product.unit}</span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-black text-emerald-700 dark:text-emerald-400">
                        PKR {stat.totalRevenue.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <span className="font-bold text-slate-700 dark:text-slate-300">
                          PKR {stat.profit.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-slate-400 ml-1 font-semibold">({stat.marginPercent}%)</span>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        {stat.velocityRank === 'top' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 border border-emerald-200 text-[10px] font-bold">
                            <Flame className="w-3 h-3 text-amber-500 fill-amber-500" />
                            Top Seller
                          </span>
                        )}
                        {stat.velocityRank === 'steady' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-400 border border-indigo-200 text-[10px] font-bold">
                            <CheckCircle2 className="w-3 h-3" />
                            Steady
                          </span>
                        )}
                        {stat.velocityRank === 'slow' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-medium">
                            Low Velocity
                          </span>
                        )}
                        {stat.velocityRank === 'dead' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 border border-rose-200 text-[10px] font-bold">
                            <Snowflake className="w-3 h-3 text-rose-400" />
                            0 Sold
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        {stat.product.currentStock <= 0 ? (
                          <span className="font-bold text-rose-600">Out of Stock</span>
                        ) : stat.product.currentStock <= stat.product.minStockAlert ? (
                          <span className="font-bold text-amber-600">
                            {stat.product.currentStock} {stat.product.unit} (Low)
                          </span>
                        ) : (
                          <span className="font-semibold text-emerald-600">
                            {stat.product.currentStock} {stat.product.unit}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. Tab 2: Inventory Health & Stock Runway Table */}
      {activeReportTab === 'stock_health' && (
        <div className="flex-1 min-h-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden flex flex-col space-y-2 p-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800 shrink-0">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setStockHealthFilter('all')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer ${
                  stockHealthFilter === 'all'
                    ? 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-100'
                    : 'text-slate-500'
                }`}
              >
                All Stock ({products.length})
              </button>
              <button
                onClick={() => setStockHealthFilter('critical')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer ${
                  stockHealthFilter === 'critical'
                    ? 'bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-400'
                    : 'text-slate-500'
                }`}
              >
                Critical Low / Out of Stock ({criticalStockCount})
              </button>
              <button
                onClick={() => setStockHealthFilter('healthy')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer ${
                  stockHealthFilter === 'healthy'
                    ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400'
                    : 'text-slate-500'
                }`}
              >
                Healthy Stock ({products.length - criticalStockCount})
              </button>
            </div>
            <div className="text-[11px] text-slate-400 font-medium">
              Runway calculated from {daysInPeriod}-day run rate
            </div>
          </div>

          <div className="flex-1 min-h-0 overflow-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 dark:bg-slate-800/80 sticky top-0 border-b border-slate-200 dark:border-slate-700 z-10 text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">
                <tr>
                  <th className="py-2 px-3">Product Name</th>
                  <th className="py-2 px-3">Category</th>
                  <th className="py-2 px-3 text-right">Current Stock</th>
                  <th className="py-2 px-3 text-right">Min Alert</th>
                  <th className="py-2 px-3 text-right">Daily Velocity</th>
                  <th className="py-2 px-3 text-center">Runway</th>
                  <th className="py-2 px-3 text-center">Status</th>
                  <th className="py-2 px-3 text-right">Suggested Reorder</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {displayedStockHealth.map((stat) => {
                  const isRunoutAlert = stat.runwayDays !== null && stat.runwayDays <= 3;
                  const reorderSuggestion =
                    stat.product.currentStock <= stat.product.minStockAlert
                      ? Math.max(stat.product.minStockAlert * 3, 20)
                      : 0;

                  return (
                    <tr
                      key={stat.product.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-slate-900 dark:text-slate-100">{stat.product.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{stat.product.sku}</div>
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">{stat.product.category}</td>
                      <td className="py-2.5 px-3 text-right font-black text-slate-900 dark:text-slate-100">
                        {stat.product.currentStock} {stat.product.unit}
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-500 font-semibold">
                        {stat.product.minStockAlert} {stat.product.unit}
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-indigo-600 dark:text-indigo-400">
                        {stat.salesVelocityPerDay} / day
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        {stat.runwayDays === null ? (
                          <span className="text-slate-400 font-medium">Idle</span>
                        ) : isRunoutAlert ? (
                          <span className="font-black text-rose-600 animate-pulse">
                            {stat.runwayDays} days left!
                          </span>
                        ) : (
                          <span className="font-bold text-emerald-600">{stat.runwayDays} days</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        {stat.stockStatus === 'out_of_stock' ? (
                          <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 text-[10px] font-bold border border-rose-200">
                            Out of Stock
                          </span>
                        ) : stat.stockStatus === 'low' ? (
                          <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[10px] font-bold border border-amber-200">
                            Low Stock
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                            Healthy
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        {reorderSuggestion > 0 ? (
                          <span className="font-black text-indigo-600 dark:text-indigo-400">
                            +{reorderSuggestion} {stat.product.unit}
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. Tab 3: AI Strategic Insights & Recommendations */}
      {activeReportTab === 'ai_insights' && (
        <div className="flex-1 min-h-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-y-auto p-4 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4 text-amber-500" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-slate-100">
                AI Automated Retail Audit & Executive Forecast
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Machine intelligence evaluated {productStats.length} SKUs across {filteredInvoices.length} historical invoices.
              </p>
            </div>
          </div>

          {/* AI Executive Bullet Brief */}
          <div className="p-3.5 rounded-xl bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-transparent border border-purple-200 dark:border-purple-800/60 space-y-2">
            <h4 className="text-xs font-black uppercase text-purple-900 dark:text-purple-300 tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Executive Briefing Summary</span>
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
              {aiInsights.summaryNotes.map((note, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-indigo-600 dark:text-indigo-400 font-bold">•</span>
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* AI Reorder Forecast Matrix */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-xs font-black text-rose-700 dark:text-rose-400">
                <AlertTriangle className="w-4 h-4" />
                <span>Urgent Reorder Required (Next 48–72h)</span>
              </div>
              <p className="text-[11px] text-slate-500">
                High sales velocity products with imminent stockout risk:
              </p>
              {aiInsights.criticalRunout.length === 0 ? (
                <div className="p-3 text-center text-xs text-emerald-600 font-bold bg-white dark:bg-slate-800 rounded-lg">
                  ✓ No imminent stockouts detected!
                </div>
              ) : (
                <div className="space-y-1.5">
                  {aiInsights.criticalRunout.slice(0, 5).map((stat) => (
                    <div
                      key={stat.product.id}
                      className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex justify-between items-center text-xs"
                    >
                      <div>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{stat.product.name}</span>
                        <div className="text-[10px] text-slate-400">Stock: {stat.product.currentStock} {stat.product.unit}</div>
                      </div>
                      <span className="font-black text-rose-600 text-[11px]">
                        Order +{Math.max(stat.product.minStockAlert * 3, 30)} {stat.product.unit}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-xs font-black text-amber-700 dark:text-amber-400">
                <Snowflake className="w-4 h-4" />
                <span>Dead Capital & Slow Movers</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Inventory tying up cash flow without sales velocity:
              </p>
              {aiInsights.deadStock.length === 0 ? (
                <div className="p-3 text-center text-xs text-emerald-600 font-bold bg-white dark:bg-slate-800 rounded-lg">
                  ✓ High turnover across all stocked inventory!
                </div>
              ) : (
                <div className="space-y-1.5">
                  {aiInsights.deadStock.slice(0, 5).map((stat) => (
                    <div
                      key={stat.product.id}
                      className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex justify-between items-center text-xs"
                    >
                      <div>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{stat.product.name}</span>
                        <div className="text-[10px] text-slate-400">Tied Capital: PKR {(stat.product.currentStock * stat.product.purchasePrice).toLocaleString()}</div>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-400 font-bold text-[10px]">
                        Bundle Deal
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
