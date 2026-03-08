import React, { useEffect, useState } from "react";
import {
  Plus,
  Package,
  Pencil,
  ArrowUpRight,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import Table from "../../components/Table/Table";
import Pagination from "../../components/Pagination/Pagination";
import SearchInput from "../../components/Search/SearchInput";
import Button from "../../components/UI/Button";
import {
  fetchBooks,
  clearBookError,
  searchBooksThunk,
} from "../../store/slices/bookSlice";
import UpdateInventoryModal from "../../components/Modal/UpdateInventoryModal";

const Inventory = () => {
  const dispatch = useDispatch();
  const { books, loading, error, totalPages, totalItems } = useSelector(
    (state) => state.books,
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [isInventoryModalOpen, setIsInventoryModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    return () => dispatch(clearBookError());
  }, [dispatch]);

  useEffect(() => {
    if (searchQuery.trim()) {
      const timer = setTimeout(() => {
        dispatch(
          searchBooksThunk({
            query: searchQuery,
            page: currentPage,
            limit: itemsPerPage,
          }),
        );
      }, 500);
      return () => clearTimeout(timer);
    } else {
      dispatch(
        fetchBooks({
          page: currentPage,
          limit: itemsPerPage,
        }),
      );
    }
  }, [dispatch, searchQuery, currentPage, itemsPerPage]);

  const handleRefresh = () => {
    dispatch(fetchBooks({ page: currentPage, limit: itemsPerPage }));
  };

  const columns = [
    {
      header: "Product",
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-12 bg-background rounded overflow-hidden border border-border shadow-sm">
            <img
              src={row.thumbnail?.url || row.thumbnail}
              className="w-full h-full object-cover"
              alt=""
            />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-text-primary text-[14px] truncate">
              {row.title}
            </span>
            <span className="text-[11px] text-text-secondary opacity-50 font-medium">
              ISBN: {row.isbn}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: "Stock",
      render: (row) => (
        <span className="text-[14px] font-bold text-text-primary">
          {row.stock || 0}
        </span>
      ),
    },
    {
      header: "Reserved",
      render: (row) => (
        <span className="text-[14px] font-medium text-text-secondary">
          {row.reserved || 0}
        </span>
      ),
    },
    {
      header: "Available",
      render: (row) => {
        const available = parseInt(
          row.available ?? row.stock - (row.reserved || 0),
        );
        return (
          <span
            className={`text-[14px] font-extrabold ${available > 0 ? "text-success" : "text-error"}`}
          >
            {available}
          </span>
        );
      },
    },
    {
      header: "Status",
      render: (row) => {
        const available = parseInt(
          row.available ?? row.stock - (row.reserved || 0),
        );
        let status = "In Stock";
        let colorClass = "bg-success-surface text-success border-success/20";

        if (available <= 0) {
          status = "Out of Stock";
          colorClass = "bg-error-surface text-error border-error/20";
        } else if (available < 5) {
          status = "Low Stock";
          colorClass = "bg-warning-surface text-warning border-warning/20";
        }

        return (
          <span
            className={`px-2.5 py-1 rounded-full text-[11px] font-bold border uppercase tracking-wider ${colorClass}`}
          >
            {status}
          </span>
        );
      },
    },
    {
      header: "Actions",
      align: "right",
      render: (row) => (
        <div className="flex items-center gap-2">
          <button
            title="Update Stock"
            onClick={() => {
              setSelectedProduct(row);
              setIsInventoryModalOpen(true);
            }}
            className="w-10 h-10 rounded-xl flex items-center justify-center bg-surface border border-border text-text-secondary hover:text-primary hover:border-primary/50 hover:bg-primary/5 transition-all shadow-sm active:scale-95"
          >
            <Pencil size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-8 pb-20 animate-fade-in">
      {/* Header & Button */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-1">
        <div>
          <h1 className="text-3xl font-black text-text-primary tracking-tight flex items-center gap-3">
            <Package className="text-primary w-8 h-8" />
            Inventory Management
          </h1>
          <p className="text-text-secondary font-medium mt-1 opacity-70">
            Monitor and manage your book stock levels.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            className="px-5 py-3 bg-surface border border-border rounded-xl font-bold text-text-secondary hover:bg-background transition-all shadow-sm flex items-center gap-2"
          >
            Refresh
          </button>
          <Button
            onClick={() => {
              setSelectedProduct(null);
              setIsInventoryModalOpen(true);
            }}
            className="rounded-xl shadow-lg shadow-primary/20"
          >
            <Plus size={18} className="mr-2" />
            Add Inventory
          </Button>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-surface rounded-3xl border border-border shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
            <Package size={28} />
          </div>
          <div>
            <p className="text-[11px] font-black text-text-secondary uppercase tracking-[0.2em] opacity-40">
              Total Books
            </p>
            <p className="text-3xl font-black text-text-primary mt-1">
              {totalItems || 0}
            </p>
          </div>
        </div>

        <div className="p-6 bg-surface rounded-3xl border border-border shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-600">
            <AlertCircle size={28} />
          </div>
          <div>
            <p className="text-[11px] font-black text-text-secondary uppercase tracking-[0.2em] opacity-40">
              Low Stock Alert
            </p>
            <p className="text-3xl font-black text-text-primary mt-1">
              {
                books.filter((b) => {
                  const available = parseInt(
                    b.available ?? b.stock - (b.reserved || 0),
                  );
                  return available > 0 && available < 5;
                }).length
              }
            </p>
          </div>
        </div>

        <div className="p-6 bg-surface rounded-3xl border border-border shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-600">
            <Package size={28} className="opacity-40" />
          </div>
          <div>
            <p className="text-[11px] font-black text-text-secondary uppercase tracking-[0.2em] opacity-40">
              Out of Stock
            </p>
            <p className="text-3xl font-black text-text-primary mt-1">
              {
                books.filter((b) => {
                  const available = parseInt(
                    b.available ?? b.stock - (b.reserved || 0),
                  );
                  return available <= 0;
                }).length
              }
            </p>
          </div>
        </div>
      </div>

      {/* Main Table Section */}
      <div className="bg-surface rounded-[32px] border border-border shadow-xl shadow-primary/5 overflow-hidden">
        <div className="p-4 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="w-full md:w-96">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search by title or ISBN..."
              onReset={() => {
                setSearchQuery("");
                setCurrentPage(1);
              }}
            />
          </div>
          <div className="flex items-center gap-2 px-2">
            <div className="flex items-center gap-2 text-[11px] font-black text-text-secondary uppercase tracking-widest bg-background px-3 py-1.5 rounded-full">
              <CheckCircle2 size={12} className="text-success" />
              Real-time Sync
            </div>
          </div>
        </div>

        <Table
          columns={columns}
          data={books}
          loading={loading}
          emptyMessage="No inventory found."
        />
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
      />

      {isInventoryModalOpen && (
        <UpdateInventoryModal
          onClose={() => setIsInventoryModalOpen(false)}
          initialProduct={selectedProduct}
          refreshAction={handleRefresh}
        />
      )}
    </div>
  );
};

export default Inventory;
