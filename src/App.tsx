import { PosProvider } from './context/PosContext';
import { usePos } from './context/usePos';
import { TopHeader } from './components/layout/TopHeader';
import { Sidebar } from './components/layout/Sidebar';
import { BarcodeSearch } from './components/pos/BarcodeSearch';
import { ProductCatalog } from './components/pos/ProductCatalog';
import { CartPanel } from './components/pos/CartPanel';
import { KhataLedgerView } from './components/khata/KhataLedgerView';
import { InventoryTableView } from './components/inventory/InventoryTableView';
import { SalesHistoryView } from './components/sales/SalesHistoryView';
import { DayClosingView } from './components/register/DayClosingView';
import { ThermalReceiptModal } from './components/pos/ThermalReceiptModal';

function PosDashboard() {
  const { activeTab, activeReceipt, setActiveReceipt, isUrdu } = usePos();

  return (
    <div
      dir={isUrdu ? 'rtl' : 'ltr'}
      className="h-screen w-screen flex flex-col bg-slate-100 text-slate-900 overflow-hidden"
    >
      {/* Global Multi-Tenant Header */}
      <TopHeader />

      {/* Main Workspace Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Navigation Sidebar */}
        <Sidebar />

        {/* Dynamic View Container */}
        <main className="flex-1 flex overflow-hidden relative bg-slate-100">
          {activeTab === 'pos' && (
            <div className="flex-1 flex h-full overflow-hidden">
              {/* Product Catalog & Search area */}
              <div className="flex-1 flex flex-col p-4 gap-3 overflow-hidden bg-slate-100">
                <BarcodeSearch />
                <ProductCatalog />
              </div>

              {/* POS Cart & Checkout Panel */}
              <CartPanel />
            </div>
          )}

          {activeTab === 'khata' && <KhataLedgerView />}
          {activeTab === 'inventory' && <InventoryTableView />}
          {activeTab === 'sales' && <SalesHistoryView />}
          {activeTab === 'register' && <DayClosingView />}
        </main>
      </div>

      {/* Thermal Receipt Modal (Triggered on Checkout completion or reprint) */}
      {activeReceipt && (
        <ThermalReceiptModal
          invoice={activeReceipt}
          onClose={() => setActiveReceipt(null)}
        />
      )}
    </div>
  );
}

export function App() {
  return (
    <PosProvider>
      <PosDashboard />
    </PosProvider>
  );
}

export default App;
