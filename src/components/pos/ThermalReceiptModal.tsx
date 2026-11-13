import { Printer, Share2, CheckCircle2, X } from 'lucide-react';
import { usePos } from '../../context/usePos';
import type { Invoice } from '../../types/pos';

interface ThermalReceiptModalProps {
  invoice: Invoice;
  onClose: () => void;
}

export function ThermalReceiptModal({
  invoice,
  onClose,
}: ThermalReceiptModalProps) {
  const { currentTenant } = usePos();

  const handlePrint = () => {
    window.print();
  };

  const handleWhatsAppShare = () => {
    if (!invoice.customer?.phone) {
      alert('No customer phone number attached to this invoice.');
      return;
    }
    const cleanPhone = invoice.customer.phone.replace(/[^0-9]/g, '');
    const formattedPhone = cleanPhone.startsWith('0') ? `92${cleanPhone.slice(1)}` : cleanPhone;
    const text = encodeURIComponent(
      `*${currentTenant.name}*\nReceipt: ${invoice.invoiceNo}\nDate: ${invoice.date}\nTotal: PKR ${invoice.grandTotal.toLocaleString()}\nThank you for shopping with us!`
    );
    window.open(`https://wa.me/${formattedPhone}?text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4 my-8">
        {/* Header Actions */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Sale Completed Successfully</span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 80mm Thermal Receipt Canvas (Clean Paper Appearance) */}
        <div
          id="printable-thermal-receipt"
          className="bg-slate-50 border border-slate-200 text-black p-5 rounded-xl shadow-xs font-mono text-[11px] leading-tight select-text"
        >
          {/* Business Header */}
          <div className="text-center pb-2 border-b border-dashed border-gray-400 space-y-0.5">
            <div className="font-extrabold text-sm tracking-tight text-slate-900">{currentTenant.name}</div>
            <div className="text-[10px] text-gray-700">{currentTenant.branch}</div>
            <div className="text-[10px] text-gray-700">{currentTenant.address}</div>
            <div className="text-[10px] text-gray-700">Tel: {currentTenant.phone}</div>
            <div className="text-[9px] text-gray-600 mt-1">
              NTN: {currentTenant.ntn} | STRN: {currentTenant.strn}
            </div>
            <div className="text-[9px] font-bold text-gray-800">
              FBR POS ID: {currentTenant.fbrPosId}
            </div>
          </div>

          {/* Invoice Meta */}
          <div className="py-2 border-b border-dashed border-gray-400 space-y-0.5 text-[10px]">
            <div className="flex justify-between">
              <span>Inv #: {invoice.invoiceNo}</span>
              <span>Reg: {invoice.deviceId}</span>
            </div>
            <div className="flex justify-between">
              <span>Date: {invoice.date}</span>
              <span>Cashier: {invoice.cashierName}</span>
            </div>
            {invoice.customer && (
              <div className="flex justify-between font-semibold pt-0.5 text-gray-800">
                <span>Customer: {invoice.customer.name}</span>
                <span>{invoice.customer.phone}</span>
              </div>
            )}
            {invoice.fbrInvoiceNo && (
              <div className="text-[9px] text-gray-600">
                FBR Inv: {invoice.fbrInvoiceNo}
              </div>
            )}
          </div>

          {/* Line Items Table */}
          <div className="py-2 border-b border-dashed border-gray-400 space-y-1">
            <div className="flex justify-between font-bold text-[10px] pb-1 border-b border-gray-300">
              <span className="w-7">Qty</span>
              <span className="flex-1">Description</span>
              <span className="w-14 text-right">Price</span>
              <span className="w-16 text-right">Total</span>
            </div>

            {invoice.items.map((item, idx) => (
              <div key={idx} className="flex justify-between items-start text-[10px]">
                <span className="w-7 font-bold">
                  {item.quantity} {item.product.unit}
                </span>
                <span className="flex-1 pr-1 truncate">{item.product.name}</span>
                <span className="w-14 text-right text-gray-600">
                  {item.unitPrice.toLocaleString()}
                </span>
                <span className="w-16 text-right font-bold">
                  {item.total.toLocaleString()}
                </span>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="py-2 border-b border-dashed border-gray-400 space-y-1 text-[10px]">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>PKR {invoice.subtotal.toLocaleString()}</span>
            </div>
            {invoice.discount > 0 && (
              <div className="flex justify-between font-bold text-gray-800">
                <span>Discount:</span>
                <span>- PKR {invoice.discount.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Sales Tax (0%):</span>
              <span>PKR {invoice.tax}</span>
            </div>
            <div className="flex justify-between font-extrabold text-xs pt-1 border-t border-gray-300 text-slate-900">
              <span>GRAND TOTAL:</span>
              <span>PKR {invoice.grandTotal.toLocaleString()}</span>
            </div>
          </div>

          {/* Tender Breakdown */}
          <div className="py-2 border-b border-dashed border-gray-400 space-y-0.5 text-[10px]">
            {invoice.payments.cash > 0 && (
              <div className="flex justify-between">
                <span>Cash Paid:</span>
                <span>PKR {invoice.payments.cash.toLocaleString()}</span>
              </div>
            )}
            {invoice.payments.card > 0 && (
              <div className="flex justify-between">
                <span>Card Paid:</span>
                <span>PKR {invoice.payments.card.toLocaleString()}</span>
              </div>
            )}
            {invoice.payments.khata > 0 && (
              <div className="flex justify-between font-bold text-gray-900">
                <span>Khata / Udhaar (Credit):</span>
                <span>PKR {invoice.payments.khata.toLocaleString()}</span>
              </div>
            )}
            {invoice.cashTendered !== undefined && invoice.cashTendered > 0 && (
              <>
                <div className="flex justify-between text-gray-600">
                  <span>Cash Tendered:</span>
                  <span>PKR {invoice.cashTendered.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>Change Returned:</span>
                  <span>PKR {(invoice.changeGiven || 0).toLocaleString()}</span>
                </div>
              </>
            )}
          </div>

          {/* Footer & Urdu Message */}
          <div className="text-center pt-3 space-y-1">
            <div className="text-[10px] font-urdu font-bold text-slate-800">
              شکریہ! خریدا ہوا سامان ۳ دن میں اصل رسید کے ساتھ تبدیل ہو سکتا ہے۔
            </div>
            <div className="text-[8px] text-gray-500">
              Powered by POSify Hybrid Multi-Tenant Engine
            </div>
          </div>
        </div>

        {/* Modal Controls */}
        <div className="grid grid-cols-2 gap-2 pt-2">
          <button
            onClick={handlePrint}
            className="py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Receipt</span>
          </button>

          {invoice.customer?.phone ? (
            <button
              onClick={handleWhatsAppShare}
              className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              <span>WhatsApp Receipt</span>
            </button>
          ) : (
            <button
              onClick={onClose}
              className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center transition-all cursor-pointer"
            >
              <span>Done (F12)</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
