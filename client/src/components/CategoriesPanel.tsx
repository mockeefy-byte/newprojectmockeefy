import { useState, useEffect, useMemo } from "react";
import axios from "../lib/axios";
import { isAxiosError } from "axios";
import { toast } from "sonner";
import { Search, RefreshCw, ChevronLeft, ChevronRight, Plus, FolderKanban, Banknote } from "lucide-react";

// Define the Category interface based on usage
interface Category {
  _id: string;
  name: string;
  description: string;
  amount: number;
  status: "Active" | "Inactive";
  type: string;
}

const CategoriesPanel = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // UI States (Search, Sort, Pagination)
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<keyof Category | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);

  // Modal States
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editAmount, setEditAmount] = useState<string | number>("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [newCategory, setNewCategory] = useState({
    name: "",
    description: "",
    amount: "",
  });

  const fetchCategories = async () => {
    setLoading(true);
    try {
      // url was /categories but needs /api/categories because baseURL is root
      const response = await axios.get(`/api/categories`);

      if (Array.isArray(response.data)) {
        setCategories(response.data);
      } else {
        setCategories([]);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to load categories");
    } finally {
      setTimeout(() => setLoading(false), 300);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // --- Actions ---

  const toggleStatus = async (id: string, currentStatus: Category['status']) => {
    try {
      const newStatus = currentStatus === "Active" ? "Inactive" : "Active";
      await axios.put(`/api/categories/${id}`, { status: newStatus });

      setCategories((prev) =>
        prev.map((cat) =>
          cat._id === id ? { ...cat, status: newStatus } : cat
        )
      );
      toast.success(`Category ${newStatus === "Active" ? "activated" : "deactivated"}`);
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    }
  };

  const openEditModal = (cat: Category) => {
    setSelectedId(cat._id);
    setEditAmount(cat.amount);
    setShowEditModal(true);
  };

  const saveAmount = async () => {
    if (editAmount === "" || Number(editAmount) < 0) return;

    try {
      await axios.put(`/api/categories/${selectedId}`, { amount: Number(editAmount) });

      setCategories((prev) =>
        prev.map((cat) =>
          cat._id === selectedId ? { ...cat, amount: Number(editAmount) } : cat
        )
      );
      setShowEditModal(false);
      toast.success("Amount updated successfully");
    } catch (error) {
      console.error("Error updating amount:", error);
      toast.error("Failed to update amount");
    }
  };

  const addCategory = async () => {
    if (!newCategory.name || !newCategory.amount) {
      toast.error("Name and amount are required");
      return;
    }

    try {
      const payload = {
        name: newCategory.name,
        description: newCategory.description,
        amount: Number(newCategory.amount),
        status: "Active",
        type: "technical" // Default type
      };

      const response = await axios.post(`/api/categories`, payload);

      setCategories([...categories, response.data]);
      setNewCategory({ name: "", description: "", amount: "" });
      setShowAddModal(false);
      toast.success("Category added successfully");
    } catch (error: any) {
      console.error("Error adding category:", error);
      if (isAxiosError(error)) {
        toast.error(error.response?.data?.message || "Failed to add category");
      } else {
        toast.error("Failed to add category");
      }
    }
  };

  // --- Filtering & Sorting ---

  const filteredCategories = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return categories;
    return categories.filter(
      (cat) =>
        cat.name.toLowerCase().includes(q) ||
        cat.description.toLowerCase().includes(q)
    );
  }, [categories, search]);

  const sortedCategories = useMemo(() => {
    if (!sortField) return filteredCategories;
    const arr = [...filteredCategories];
    arr.sort((a, b) => {
      if (sortField === "amount") {
        return sortOrder === "asc" ? a.amount - b.amount : b.amount - a.amount;
      }
      if (sortField === "name") {
        return sortOrder === "asc"
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      }
      // Add other sort fields if needed, default string compare
      const valA = String(a[sortField] || "");
      const valB = String(b[sortField] || "");
      return sortOrder === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
    });
    return arr;
  }, [filteredCategories, sortField, sortOrder]);

  // --- Pagination ---

  const totalPages = Math.max(1, Math.ceil(sortedCategories.length / pageSize));

  // Reset page if out of bounds
  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [totalPages, page, search]);

  const paginatedCategories = useMemo(() => {
    const start = (page - 1) * pageSize;
    return sortedCategories.slice(start, start + pageSize);
  }, [sortedCategories, page, pageSize]);

  // --- Helper Components ---

  const handleSort = (field: keyof Category) => {
    if (sortField === field) {
      setSortOrder((o) => (o === "desc" ? "asc" : "desc"));
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
    setPage(1);
  };

  const SkeletonRow = () => (
    <tr className="animate-pulse border-b border-gray-100/50">
      <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-48"></div></td>
      <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-full max-w-xs"></div></td>
      <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
      <td className="px-6 py-4"><div className="h-6 bg-gray-200 rounded-full w-20"></div></td>
      <td className="px-6 py-4 text-right"><div className="h-8 bg-gray-200 rounded w-32 ml-auto"></div></td>
    </tr>
  );

  return (
    // MAIN PAGE CONTAINER - SINGLE CARD LAYOUT
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 min-h-[calc(100vh-8rem)]">

      {/* Header with Search, Refresh and Add Action */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Category Management</h2>
          <p className="text-sm text-gray-500 mt-1">Organize and manage service categories.</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search categories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
            />
          </div>
          <button
            onClick={fetchCategories}
            className="p-2 text-gray-500 hover:text-blue-600 bg-gray-50 hover:bg-blue-50 rounded-lg border border-gray-200 transition-colors"
            title="Refresh List"
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Plus size={16} />
            Add Category
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden min-h-[400px]">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50/50 border-b border-gray-100">
            <tr>
              <th
                onClick={() => handleSort("name")}
                className="py-4 px-6 font-medium text-gray-500 text-xs uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
              >
                Category
              </th>
              <th className="py-4 px-6 font-medium text-gray-500 text-xs uppercase tracking-wider">Description</th>
              <th
                onClick={() => handleSort("amount")}
                className="py-4 px-6 font-medium text-gray-500 text-xs uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
              >
                Amount
              </th>
              <th className="py-4 px-6 font-medium text-gray-500 text-xs uppercase tracking-wider">Status</th>
              <th className="py-4 px-6 font-medium text-gray-500 text-xs uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              // Flicker-Free Skeleton Loading
              Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
            ) : paginatedCategories.length > 0 ? (
              paginatedCategories.map((cat) => (
                <tr key={cat._id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                        <FolderKanban size={16} />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{cat.name}</p>
                        <p className="text-xs text-gray-500 font-mono">ID: {cat._id.substring(0, 6)}...</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <p className="text-gray-600 text-sm max-w-xs truncate" title={cat.description}>{cat.description || "-"}</p>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2 text-gray-900 font-medium">
                      <Banknote size={14} className="text-gray-400" />
                      ₹{cat.amount ? cat.amount.toLocaleString() : 0}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${cat.status === "Active"
                      ? "bg-green-50 text-green-700 border-green-100"
                      : "bg-red-50 text-red-700 border-red-100"
                      }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${cat.status === "Active" ? "bg-green-500" : "bg-red-500"}`}></span>
                      {cat.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEditModal(cat)}
                        className="px-3 py-1.5 bg-gray-50 text-gray-700 hover:bg-gray-100 rounded-md text-xs font-medium transition-colors border border-gray-200"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => toggleStatus(cat._id, cat.status)}
                        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors border ${cat.status === "Active"
                          ? "bg-white text-red-600 border-red-200 hover:bg-red-50"
                          : "bg-white text-green-600 border-green-200 hover:bg-green-50"
                          }`}
                      >
                        {cat.status === "Active" ? "Deactivate" : "Activate"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="py-20 text-center text-gray-500">
                  No categories found matching your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {!loading && sortedCategories.length > 0 && (
        <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-4">
          <span className="text-sm text-gray-500">
            Showing {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, sortedCategories.length)} of {sortedCategories.length}
          </span>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className={`p-2 rounded-lg border ${page === 1 ? 'border-gray-100 text-gray-300 cursor-not-allowed' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center space-x-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                // Simple logic to show limited pages
                if (p !== 1 && p !== totalPages && (p < page - 1 || p > page + 1)) {
                  if (p === page - 2 || p === page + 2) return <span key={p} className="px-1 text-gray-400">..</span>;
                  return null;
                }
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${page === p
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:bg-gray-50'
                      }`}
                  >
                    {p}
                  </button>
                )
              })}
            </div>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className={`p-2 rounded-lg border ${page === totalPages ? 'border-gray-100 text-gray-300 cursor-not-allowed' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Edit Amount Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <h3 className="text-lg font-bold text-gray-900">Edit Amount</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Amount (₹)
                  </label>
                  <div className="relative">
                    <Banknote className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="number"
                      value={editAmount}
                      onChange={(e) => setEditAmount(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                      placeholder="Enter amount"
                      min="0"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200 bg-white"
              >
                Cancel
              </button>
              <button
                onClick={saveAmount}
                className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Category Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <h3 className="text-lg font-bold text-gray-900">Add New Category</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Category Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Web Development"
                    value={newCategory.name}
                    onChange={(e) =>
                      setNewCategory({ ...newCategory, name: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Description
                  </label>
                  <textarea
                    placeholder="Brief description of the category..."
                    value={newCategory.description}
                    onChange={(e) =>
                      setNewCategory({ ...newCategory, description: e.target.value })
                    }
                    rows={3}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Amount (₹)
                  </label>
                  <div className="relative">
                    <Banknote className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="number"
                      placeholder="0.00"
                      value={newCategory.amount}
                      onChange={(e) =>
                        setNewCategory({ ...newCategory, amount: e.target.value })
                      }
                      className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                      min="0"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200 bg-white"
              >
                Cancel
              </button>
              <button
                onClick={addCategory}
                className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
              >
                Add Category
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoriesPanel;