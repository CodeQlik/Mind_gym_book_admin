import React from "react";
import { Loader2, Database } from "lucide-react";

/**
 * Premium High-End Data Table
 * Features glassmorphism, smooth hover states, and refined typography.
 */
const Table = ({
  columns,
  data,
  loading,
  emptyMessage = "No data available",
}) => {
  return (
    <div className="w-full relative animate-fade-in font-['Outfit']">
      <div className="w-full overflow-x-auto rounded-[2rem] border border-border bg-surface shadow-sm overflow-hidden">
        <table className="w-full border-collapse text-left min-w-[900px]">
          <thead>
            <tr className="bg-background/80 border-b border-border">
              {columns.map((column, index) => (
                <th
                  key={index}
                  className={`py-5 px-6 font-black text-text-secondary text-[11px] uppercase tracking-[0.15em] first:pl-10 last:pr-10 ${
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
                  className="text-center py-24 bg-background/30"
                >
                  <div className="flex flex-col items-center gap-4">
                    <Loader2
                      className="w-12 h-12 text-primary/50 animate-spin"
                      strokeWidth={2}
                    />
                    <p className="text-text-secondary text-sm font-bold tracking-wide">
                      Loading data...
                    </p>
                  </div>
                </td>
              </tr>
            ) : !data || !Array.isArray(data) ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="text-center py-24 text-rose-500"
                >
                  <div className="flex flex-col items-center gap-3">
                    <Database className="w-12 h-12 opacity-20" />
                    <span className="text-sm font-bold tracking-wide">
                      Connection interrupted
                    </span>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="text-center py-24 text-text-secondary"
                >
                  <div className="flex flex-col items-center gap-4 opacity-50">
                    <Database className="w-12 h-12" strokeWidth={1} />
                    <p className="text-sm font-bold tracking-wide">
                      {emptyMessage}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className="group hover:bg-background/50 transition-colors duration-300"
                >
                  {columns.map((column, colIndex) => (
                    <td
                      key={colIndex}
                      className={`py-5 px-6 text-sm font-medium text-text-primary first:pl-10 last:pr-10 transition-colors ${
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
