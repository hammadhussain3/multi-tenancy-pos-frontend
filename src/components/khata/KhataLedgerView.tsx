import { useState, useMemo } from 'react';
import {
  BookOpen,
  Search,
  UserPlus,
  Phone,
  Banknote,
  Share2,
  FileText,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowLeft,
  Users,
} from 'lucide-react';
import { usePos } from '../../context/usePos';
import type { Customer } from '../../types/pos';
import { ReceivePaymentModal } from './ReceivePaymentModal';
import { DataTablePagination } from '../common/DataTablePagination';

export function KhataLedgerView() {
  const { customers, customerLedgers, currentTenant, isUrdu } = usePos();
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(customers[0]?.id || '');
  const [searchCustomer, setSearchCustomer] = useState<string>('');
  const [activePaymentCustomer, setActivePaymentCustomer] = useState<Customer | null>(null);
  const [mobileTab, setMobileTab] = useState<'directory' | 'statement'>('directory');

  // Ledger Table Pagination (Default: 10 records per page)
  const [ledgerPage, setLedgerPage] = useState<number>(1);
  const [ledgerPageSize, setLedgerPageSize] = useState<number>(10);

  const filteredCustomers = useMemo(() => {
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(searchCustomer.toLowerCase()) ||
        c.phone.includes(searchCustomer)
    );
  }, [customers, searchCustomer]);

  const activeCustomer = customers.find((c) => c.id === selectedCustomerId) || customers[0];
  const activeLedger = useMemo(() => {
    return activeCustomer ? customerLedgers[activeCustomer.id] || [] : [];
  }, [activeCustomer, customerLedgers]);

  const totalLedgerPages = Math.max(1, Math.ceil(activeLedger.length / ledgerPageSize));
  const validLedgerPage = Math.min(Math.max(1, ledgerPage), totalLedgerPages);
  const paginatedLedger = useMemo(() => {
    const start = (validLedgerPage - 1) * ledgerPageSize;
    return activeLedger.slice(start, start + ledgerPageSize);
  }, [activeLedger, validLedgerPage, ledgerPageSize]);

  const totalOutstandingUdhaar = customers.reduce((sum, c) => sum + c.currentBalance, 0);

  const handleWhatsAppReminder = (customer: Customer) => {
    const cleanPhone = customer.phone.replace(/[^0-9]/g, '');
    const formattedPhone = cleanPhone.startsWith('0') ? `92${cleanPhone.slice(1)}` : cleanPhone;
    const text = encodeURIComponent(
      `*Khata Reminder - ${currentTenant.name}*\nDear ${customer.name},\nYour total outstanding balance (Udhaar) is *PKR ${customer.currentBalance.toLocaleString()}*.\nPlease settle your payment at your earliest convenience.\nThank you.`
    );
    window.open(`https://wa.me/${formattedPhone}?text=${text}`, '_blank');
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col overflow-hidden bg-slate-50 dark:bg-[#0b0f19] p-2.5 sm:p-3.5 gap-2 sm:gap-3 transition-colors duration-200">
      {/* Top Metric Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 shrink-0">
        <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Udhaar / Credit Given</div>
            <div className="text-lg sm:text-xl font-extrabold text-amber-800 dark:text-amber-400 mt-1">
              PKR {totalOutstandingUdhaar.toLocaleString()}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
        </div>

        <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">Registered Khata Customers</div>
            <div className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-slate-100 mt-1">
              {customers.length}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <UserPlus className="w-5 h-5" />
          </div>
        </div>

        <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">Customers with Balance</div>
            <div className="text-lg sm:text-xl font-extrabold text-emerald-700 dark:text-emerald-400 mt-1">
              {customers.filter((c) => c.currentBalance > 0).length}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Banknote className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Mobile Tab Pill Switcher (Visible on < lg screens) */}
      <div className="lg:hidden flex items-center p-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shrink-0">
        <button
          onClick={() => setMobileTab('directory')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            mobileTab === 'directory'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Customer Directory ({filteredCustomers.length})</span>
        </button>
        <button
          onClick={() => setMobileTab('statement')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            mobileTab === 'statement'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Statement: {activeCustomer?.name.split(' ')[0] || 'View'}</span>
        </button>
      </div>

      {/* Main Split: Customers List on Left, Ledger History on Right */}
      <div className="flex-1 flex gap-4 overflow-hidden relative">
        {/* Customer Directory */}
        <div
          className={`${
            mobileTab === 'directory' ? 'flex' : 'hidden'
          } lg:flex w-full lg:w-80 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs flex-col shrink-0 overflow-hidden`}
        >
          <div className="p-3 border-b border-slate-100 dark:border-slate-800 space-y-2 bg-slate-50/50 dark:bg-slate-800/50">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400 dark:text-slate-500" />
              <input
                type="text"
                value={searchCustomer}
                onChange={(e) => setSearchCustomer(e.target.value)}
                placeholder="Search by name or phone..."
                className="w-full pl-9 pr-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-2xs"
              />
            </div>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto p-2 space-y-1.5">
            {filteredCustomers.map((customer) => {
              const isSelected = activeCustomer?.id === customer.id;
              const isOverLimit = customer.currentBalance > customer.creditLimit;

              return (
                <button
                  key={customer.id}
                  onClick={() => {
                    setSelectedCustomerId(customer.id);
                    setLedgerPage(1);
                    setMobileTab('statement');
                  }}
                  className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-50/80 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800 text-slate-900 dark:text-slate-100 shadow-xs'
                      : 'bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="font-bold text-xs text-slate-900 dark:text-slate-100">{customer.name}</div>
                    <div
                      className={`text-xs font-bold ${
                        customer.currentBalance > 0
                          ? 'text-amber-800 dark:text-amber-400'
                          : 'text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      PKR {customer.currentBalance.toLocaleString()}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                      {customer.phone}
                    </span>
                    {isOverLimit && (
                      <span className="text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 px-1 rounded border border-rose-200 dark:border-rose-800/60 flex items-center gap-0.5 font-bold">
                        <AlertTriangle className="w-2.5 h-2.5" /> Over Limit
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Customer Ledger View */}
        {activeCustomer ? (
          <div
            className={`${
              mobileTab === 'statement' ? 'flex' : 'hidden'
            } lg:flex flex-1 min-h-0 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs flex-col overflow-hidden`}
          >
            {/* Header info */}
            <div className="p-3 sm:p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/70 dark:bg-slate-800/60 shrink-0">
              <div>
                <div className="flex items-center gap-2">
                  {/* Mobile Back Button */}
                  <button
                    onClick={() => setMobileTab('directory')}
                    className="lg:hidden p-1 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
                    title="Back to customers list"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>

                  <span className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-slate-100">
                    {activeCustomer.name}
                  </span>
                  <span className="px-2 py-0.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-[10px] rounded-full">
                    {activeCustomer.city}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Phone: {activeCustomer.phone} • Credit Limit: PKR{' '}
                  {activeCustomer.creditLimit.toLocaleString()}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleWhatsAppReminder(activeCustomer)}
                  className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span className="hidden sm:inline">WhatsApp Reminder</span>
                  <span className="sm:hidden">WhatsApp</span>
                </button>

                <button
                  onClick={() => setActivePaymentCustomer(activeCustomer)}
                  className="px-3 sm:px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                >
                  <Banknote className="w-3.5 h-3.5 shrink-0" />
                  <span>Receive Payment</span>
                </button>
              </div>
            </div>

            {/* Ledger Timeline Table */}
            <div className="flex-1 min-h-0 overflow-hidden p-2.5 sm:p-3.5 flex flex-col gap-2">
              <div className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 shrink-0">
                <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Double-Entry Statement (Khata Register)</span>
              </div>

              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs overflow-hidden flex flex-col flex-1 min-h-0">
                <div className="flex-1 min-h-0 overflow-auto">
                  <table className="w-full text-left text-xs min-w-[620px]">
                    <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 uppercase text-[10px] font-semibold sticky top-0 z-10 border-b border-slate-200 dark:border-slate-800 backdrop-blur-xs">
                    <tr>
                      <th className="py-2.5 px-3">Date & Time</th>
                      <th className="py-2.5 px-3">Type & Ref</th>
                      <th className="py-2.5 px-3">Narration / Details</th>
                      <th className="py-2.5 px-3 text-right text-rose-700 dark:text-rose-400">Debit (Udhaar)</th>
                      <th className="py-2.5 px-3 text-right text-emerald-700 dark:text-emerald-400">Credit (Paid)</th>
                      <th className="py-2.5 px-3 text-right text-slate-900 dark:text-slate-100">Running Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {activeLedger.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-8 text-slate-400 dark:text-slate-500">
                          No ledger history found for this customer.
                        </td>
                      </tr>
                    ) : (
                      paginatedLedger.map((entry) => (
                        <tr key={entry.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                          <td className="py-2.5 px-3 text-slate-500 dark:text-slate-400 text-[11px]">
                            {entry.date}
                          </td>
                          <td className="py-2.5 px-3 text-[11px] font-bold text-slate-900 dark:text-slate-100">
                            <span className="flex items-center gap-1">
                              {entry.debit > 0 ? (
                                <ArrowUpRight className="w-3 h-3 text-rose-600 dark:text-rose-400" />
                              ) : (
                                <ArrowDownLeft className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                              )}
                              {entry.referenceNo}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300">{entry.narration}</td>
                          <td className="py-2.5 px-3 text-right font-bold text-rose-700 dark:text-rose-400">
                            {entry.debit > 0 ? `PKR ${entry.debit.toLocaleString()}` : '-'}
                          </td>
                          <td className="py-2.5 px-3 text-right font-bold text-emerald-700 dark:text-emerald-400">
                            {entry.credit > 0 ? `PKR ${entry.credit.toLocaleString()}` : '-'}
                          </td>
                          <td className="py-2.5 px-3 text-right font-black text-amber-800 dark:text-amber-400">
                            PKR {entry.runningBalance.toLocaleString()}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                  </table>
                </div>

                {/* DataTable Pagination (Default: 10 records per page) */}
                <DataTablePagination
                  currentPage={validLedgerPage}
                  totalPages={totalLedgerPages}
                  pageSize={ledgerPageSize}
                  totalItems={activeLedger.length}
                  onPageChange={setLedgerPage}
                  onPageSizeChange={setLedgerPageSize}
                  isUrdu={isUrdu}
                  itemLabel="transactions"
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-center p-6 text-slate-400 dark:text-slate-500 text-xs">
            Select a customer from the directory to inspect statement.
          </div>
        )}
      </div>

      {/* Receive Payment Modal */}
      {activePaymentCustomer && (
        <ReceivePaymentModal
          customer={activePaymentCustomer}
          onClose={() => setActivePaymentCustomer(null)}
        />
      )}
    </div>
  );
}
