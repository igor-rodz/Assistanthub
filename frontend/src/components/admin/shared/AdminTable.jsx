import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * AdminTable - Reusable table component with pagination, sorting, and filtering
 */
const AdminTable = ({
    columns,  // [{ key, label, sortable, render }]
    data,     // Array of objects
    onSort,   // (key) => void
    sortKey,
    sortOrder = 'asc',
    currentPage = 1,
    totalPages = 1,
    onPageChange,
    loading = false
}) => {
    const handleSort = (key) => {
        if (onSort) {
            onSort(key);
        }
    };

    return (
        <div className="w-full">
            {/* Table */}
            <div className="overflow-x-auto rounded-xl border border-white/5 bg-white/[0.02]">
                <table className="w-full">
                    <thead className="bg-white/5 border-b border-white/5 sticky top-0">
                        <tr>
                            {columns.map((col, index) => (
                                <th
                                    key={index}
                                    className={cn(
                                        "px-4 py-3 text-left text-xs font-semibold text-white/50 uppercase tracking-wider",
                                        col.sortable && "cursor-pointer hover:bg-white/5 transition-colors select-none"
                                    )}
                                    onClick={() => col.sortable && handleSort(col.key)}
                                >
                                    <div className="flex items-center gap-2">
                                        {col.label}
                                        {col.sortable && sortKey === col.key && (
                                            <span className="text-orange-400">
                                                {sortOrder === 'asc' ? '↑' : '↓'}
                                            </span>
                                        )}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {loading ? (
                            <tr>
                                <td colSpan={columns.length} className="px-4 py-12 text-center">
                                    <div className="flex items-center justify-center gap-3">
                                        <div className="w-5 h-5 border-2 border-orange-500/20 border-t-orange-500 rounded-full animate-spin" />
                                        <span className="text-white/50">Carregando...</span>
                                    </div>
                                </td>
                            </tr>
                        ) : data.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length} className="px-4 py-12 text-center text-white/50">
                                    Nenhum dado encontrado
                                </td>
                            </tr>
                        ) : (
                            data.map((row, rowIndex) => (
                                <tr
                                    key={rowIndex}
                                    className="hover:bg-white/5 transition-colors"
                                >
                                    {columns.map((col, colIndex) => (
                                        <td key={colIndex} className="px-4 py-3 text-sm text-white/70">
                                            {col.render ? col.render(row) : row[col.key]}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                    <div className="text-sm text-white/50">
                        Página {currentPage} de {totalPages}
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => onPageChange(1)}
                            disabled={currentPage === 1}
                            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronsLeft size={16} className="text-white/70" />
                        </button>
                        <button
                            onClick={() => onPageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronLeft size={16} className="text-white/70" />
                        </button>

                        <div className="px-4 py-2 bg-orange-500/10 text-orange-400 rounded-lg font-medium text-sm">
                            {currentPage}
                        </div>

                        <button
                            onClick={() => onPageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronRight size={16} className="text-white/70" />
                        </button>
                        <button
                            onClick={() => onPageChange(totalPages)}
                            disabled={currentPage === totalPages}
                            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronsRight size={16} className="text-white/70" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminTable;
