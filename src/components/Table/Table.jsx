import React from "react";
import { Loader2, Database } from "lucide-react";

/**
 * Standard Data Table
 * Simple, clean, and professional design.
 */
const Table = ({
  columns,
  data,
  loading,
  emptyMessage = "No data available",
}) => {
  return (
    <div className="w-full relative animate-fade-in">
      <div className="w-full overflow-x-auto rounded-lg border border-border bg-surface overflow-hidden">
        <table className="w-full border-collapse text-left min-w-[800px]">
          <thead>
            <tr className="bg-background border-b border-border">
              {columns.map((column, index) => (
                <th
                  key={index}
                  className={`py-3 px-4 font-bold text-text-secondary text-[15px] uppercase tracking-wider first:pl-6 last:pr-6 ${
                    column.align === "center"
                      ? "text-center"
                      : column.align === "right"
                        ? "text-right"
                        : "text-left"
                  }`}
                  style={{ width: column.width }}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {loading ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="text-center py-20 bg-background/10"
                >
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-10 h-10 text-primary/40 animate-spin" />
                    <p className="text-text-secondary text-[15px] font-semibold">
                      Loading data...
                    </p>
                  </div>
                </td>
              </tr>
            ) : !data || !Array.isArray(data) ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="text-center py-20 text-error"
                >
                  <div className="flex flex-col items-center gap-2">
                    <Database className="w-10 h-10 opacity-20" />
                    <span className="text-[15px] font-semibold">
                      Connection interrupted
                    </span>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="text-center py-20 text-text-secondary"
                >
                  <div className="flex flex-col items-center gap-2 opacity-40">
                    <Database className="w-10 h-10" />
                    <p className="text-[15px] font-semibold">{emptyMessage}</p>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className="hover:bg-background/40 transition-colors"
                >
                  {columns.map((column, colIndex) => (
                    <td
                      key={colIndex}
                      className={`py-3.5 px-4 text-base text-text-primary first:pl-6 last:pr-6 ${
                        column.align === "center"
                          ? "text-center"
                          : column.align === "right"
                            ? "text-right"
                            : "text-left"
                      }`}
                    >
                      <div
                        className={`flex items-center ${
                          column.align === "center"
                            ? "justify-center"
                            : column.align === "right"
                              ? "justify-end"
                              : "justify-start"
                        }`}
                      >
                        {column.render
                          ? column.render(row, rowIndex)
                          : row[column.accessor]}
                      </div>
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Table;
