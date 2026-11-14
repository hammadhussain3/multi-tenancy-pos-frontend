import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';

export interface DataTablePaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
  isUrdu?: boolean;
  itemLabel?: string;
  className?: string;
}

function getPageNumbers(currentPage: number, totalPages: number): (number | '...')[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, '...', totalPages];
  }
  if (currentPage >= totalPages - 3) {
    return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }
  return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
}

export function DataTablePagination({
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50, 100],
  isUrdu = false,
  itemLabel = 'entries',
  className = '',
}: DataTablePaginationProps) {
  if (totalItems === 0) return null;

  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);
  const pageNumbers = getPageNumbers(currentPage, totalPages);

  return (
    <div
      className={`px-3 py-2 sm:px-4 sm:py-2 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex flex-col sm:flex-row sm:flex-wrap items-center justify-between gap-2 text-xs shrink-0 select-none z-10 relative ${className}`}
    >
      {/* Left Info & Per-Page Selector */}
      <div className="flex items-center gap-2.5 sm:gap-3 text-slate-500 dark:text-slate-400">
        <div className="text-[11px] font-medium leading-none">
          {isUrdu ? (
            <>
              کل <strong className="text-slate-800 dark:text-slate-200 font-bold">{totalItems.toLocaleString()}</strong> میں سے{' '}
              <strong className="text-slate-800 dark:text-slate-200 font-bold">{startItem}</strong> سے{' '}
              <strong className="text-slate-800 dark:text-slate-200 font-bold">{endItem}</strong> ریکارڈز
            </>
          ) : (
            <>
              Showing <strong className="text-slate-800 dark:text-slate-200 font-bold">{startItem}</strong> to{' '}
              <strong className="text-slate-800 dark:text-slate-200 font-bold">{endItem}</strong> of{' '}
              <strong className="text-slate-800 dark:text-slate-200 font-bold">{totalItems.toLocaleString()}</strong> {itemLabel}
            </>
          )}
        </div>

        {onPageSizeChange && (
          <div className="flex items-center gap-1.5 pl-2.5 border-l border-slate-200 dark:border-slate-700">
            <label htmlFor="pagination-page-size" className="text-[11px] text-slate-400 font-medium hidden sm:inline">
              {isUrdu ? 'فی صفحہ:' : 'Show:'}
            </label>
            <select
              id="pagination-page-size"
              value={pageSize}
              onChange={(e) => {
                onPageSizeChange(Number(e.target.value));
                onPageChange(1);
              }}
              className="px-2 py-0.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-[11px] focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer shadow-2xs"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
              {isUrdu ? 'ریکارڈز' : 'per page'}
            </span>
          </div>
        )}
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-1">
        {/* First Page */}
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage <= 1}
          title={isUrdu ? 'پہلا صفحہ' : 'First Page'}
          className="w-7 h-7 flex items-center justify-center rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer shadow-2xs"
        >
          <ChevronsLeft className="w-3.5 h-3.5 rtl:rotate-180" />
        </button>

        {/* Previous Page */}
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage <= 1}
          title={isUrdu ? 'پچھلا صفحہ' : 'Previous Page'}
          className="w-7 h-7 flex items-center justify-center rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer shadow-2xs"
        >
          <ChevronLeft className="w-3.5 h-3.5 rtl:rotate-180" />
        </button>

        {/* Numbered Page Buttons */}
        <div className="flex items-center gap-1 mx-0.5">
          {pageNumbers.map((p, i) =>
            p === '...' ? (
              <span key={`ellipsis-${i}`} className="w-5 h-7 flex items-center justify-center text-slate-400 font-bold select-none text-[11px]">
                ...
              </span>
            ) : (
              <button
                key={`page-${p}`}
                onClick={() => onPageChange(p as number)}
                className={`min-w-7 h-7 px-1.5 flex items-center justify-center rounded-lg text-[11px] font-bold transition-all cursor-pointer shadow-2xs ${
                  currentPage === p
                    ? 'bg-indigo-600 text-white shadow-xs font-black'
                    : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                {p}
              </button>
            )
          )}
        </div>

        {/* Next Page */}
        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage >= totalPages}
          title={isUrdu ? 'اگلا صفحہ' : 'Next Page'}
          className="w-7 h-7 flex items-center justify-center rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer shadow-2xs"
        >
          <ChevronRight className="w-3.5 h-3.5 rtl:rotate-180" />
        </button>

        {/* Last Page */}
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage >= totalPages}
          title={isUrdu ? 'آخری صفحہ' : 'Last Page'}
          className="w-7 h-7 flex items-center justify-center rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer shadow-2xs"
        >
          <ChevronsRight className="w-3.5 h-3.5 rtl:rotate-180" />
        </button>
      </div>
    </div>
  );
}
