import React from "react";

/**
 * Custom Styled Pagination Matching User Design
 */
const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage,
}) => {
  const getPageNumbers = () => {
    let pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 4) {
        pages = [1, 2, 3, 4, 5, "...", totalPages];
      } else if (currentPage >= totalPages - 3) {
        pages = [
          1,
          "...",
          totalPages - 4,
          totalPages - 3,
          totalPages - 2,
          totalPages - 1,
          totalPages,
        ];
      } else {
        pages = [
          1,
          "...",
          currentPage - 1,
          currentPage,
          currentPage + 1,
          "...",
          totalPages,
        ];
      }
    }
    return pages;
  };

  if (totalPages <= 1) return null;

  const buttonBaseStyles =
    "px-5 py-2.5 flex items-center justify-center transition-all duration-200 font-bold text-[0.75rem] uppercase tracking-wide cursor-pointer border-none bg-transparent h-full min-w-[45px]";
  const activeStyles = "bg-primary/10 text-primary";
  const inactiveStyles =
    "text-text-secondary hover:text-primary hover:bg-background";
  const dividerStyles = "w-[1px] h-full bg-border";

  return (
    <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-6 py-4 animate-fade-in font-['Outfit']">
      <div className="flex items-center gap-3">
        <div
          className={`w-2 h-2 rounded-full animate-pulse ${totalPages > 1 ? "bg-primary" : "bg-emerald-500"}`}
        />
        <div className="text-[10px] font-black text-text-secondary/50 uppercase tracking-[0.2em]">
          Showing{" "}
          <span className="text-text-primary">
            {Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)}
          </span>{" "}
          to{" "}
          <span className="text-text-primary">
            {Math.min(currentPage * itemsPerPage, totalItems)}
          </span>{" "}
          of <span className="text-primary">{totalItems}</span> Records
        </div>
      </div>

      <div className="flex items-center bg-surface border border-border rounded-xl overflow-hidden shadow-sm h-11">
        {/* Previous Button */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`${buttonBaseStyles} ${inactiveStyles} ${
            currentPage === 1 ? "opacity-30 cursor-not-allowed" : ""
          } px-7`}
        >
          Previous
        </button>

        <div className={dividerStyles} />

        {/* Page Numbers */}
        {getPageNumbers().map((page, index) => (
          <React.Fragment key={index}>
            {page === "..." ? (
              <div className="h-full flex items-center">
                <span
                  className={`${buttonBaseStyles} text-text-secondary cursor-default px-3`}
                >
                  ...
                </span>
                {index < getPageNumbers().length - 1 && (
                  <div className={dividerStyles} />
                )}
              </div>
            ) : (
              <div className="flex items-center h-full">
                <button
                  onClick={() => onPageChange(page)}
                  className={`${buttonBaseStyles} ${
                    currentPage === page ? activeStyles : inactiveStyles
                  }`}
                >
                  {page}
                </button>
                {index < getPageNumbers().length - 1 && (
                  <div className={dividerStyles} />
                )}
              </div>
            )}
          </React.Fragment>
        ))}

        <div className={dividerStyles} />

        {/* Next Button */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`${buttonBaseStyles} ${inactiveStyles} ${
            currentPage === totalPages ? "opacity-30 cursor-not-allowed" : ""
          } px-7`}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Pagination;
