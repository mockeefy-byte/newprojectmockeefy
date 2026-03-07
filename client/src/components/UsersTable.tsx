import React, { useState, useMemo, useEffect } from "react";
import axios from "../lib/axios";
import { toast } from "sonner";
import { Search, RefreshCw, ChevronLeft, ChevronRight, User, Shield, ShieldAlert, Calendar } from "lucide-react";

interface UserData {
  _id: string;
  name: string;
  email: string;
  sessions?: number;
  createdAt: string;
  joined?: string; // fallback if createdAt missing
  status: "Active" | "Blocked";
}

const UsersTable = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<keyof UserData | "sessions">("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(8); // Match other tables

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/admin/users');
      if (res.data.success) {
        setUsers(res.data.data);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to fetch users");
    } finally {
      setTimeout(() => setLoading(false), 300);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleStatus = async (id: string, currentStatus: string) => {
    try {
      const res = await axios.put(`/api/admin/users/${id}/status`);
      if (res.data.success) {
        setUsers((prev) =>
          prev.map((u) =>
            u._id === id ? { ...u, status: res.data.data.status } : u
          )
        );
        toast.success(res.data.message);
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    }
  };

  // Filtering by search
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        (u.name && u.name.toLowerCase().includes(q)) ||
        (u.email && u.email.toLowerCase().includes(q))
    );
  }, [users, search]);

  // Sorting helper
  const sorted = useMemo(() => {
    const arr = [...filtered];
    arr.sort((a, b) => {
      if (sortField === "sessions") {
        const sA = a.sessions || 0;
        const sB = b.sessions || 0;
        return sortOrder === "asc" ? sA - sB : sB - sA;
      }
      if (sortField === "createdAt") {
        const da = new Date(a.createdAt || a.joined || 0).getTime();
        const db = new Date(b.createdAt || b.joined || 0).getTime();
        return sortOrder === "asc" ? da - db : db - da;
      }

      const valA = String(a[sortField] || "").toLowerCase();
      const valB = String(b[sortField] || "").toLowerCase();
      return sortOrder === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
    });
    return arr;
  }, [filtered, sortField, sortOrder]);

  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));

  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [totalPages, page, search]); // Reset page on search change

  const pageData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [sorted, page, pageSize]);

  const handleSort = (field: keyof UserData | "sessions") => {
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
      <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-32"></div><div className="h-3 bg-gray-100 rounded w-20 mt-2"></div></td>
      <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-48"></div></td>
      <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-16 mx-auto text-center"></div></td>
      <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
      <td className="px-6 py-4"><div className="h-6 bg-gray-200 rounded-full w-20"></div></td>
      <td className="px-6 py-4 text-right"><div className="h-8 bg-gray-200 rounded w-20 ml-auto"></div></td>
    </tr>
  );

  return (
    // MAIN PAGE CONTAINER - SINGLE CARD LAYOUT
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 min-h-[calc(100vh-8rem)]">

      {/* Header with Search and Refresh */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
          <p className="text-sm text-gray-500 mt-1">Monitor and manage user accounts.</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
            />
          </div>
          <button
            onClick={fetchUsers}
            className="p-2 text-gray-500 hover:text-blue-600 bg-gray-50 hover:bg-blue-50 rounded-lg border border-gray-200 transition-colors"
            title="Refresh List"
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden min-h-[400px]">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50/50 border-b border-gray-100">
            <tr>
              <th onClick={() => handleSort("name")} className="py-4 px-6 font-medium text-gray-500 text-xs uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors">Name</th>
              <th onClick={() => handleSort("email")} className="py-4 px-6 font-medium text-gray-500 text-xs uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors">Email</th>
              <th onClick={() => handleSort("sessions")} className="py-4 px-6 font-medium text-gray-500 text-xs uppercase tracking-wider text-center cursor-pointer hover:bg-gray-100 transition-colors">Sessions</th>
              <th onClick={() => handleSort("createdAt")} className="py-4 px-6 font-medium text-gray-500 text-xs uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors">Joined</th>
              <th className="py-4 px-6 font-medium text-gray-500 text-xs uppercase tracking-wider">Status</th>
              <th className="py-4 px-6 font-medium text-gray-500 text-xs uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              // Flicker-Free Skeleton Loading
              Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
            ) : pageData.length > 0 ? (
              pageData.map((u) => (
                <tr key={u._id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                        <User size={14} />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{u.name}</p>
                        <p className="text-xs text-gray-500 font-mono">ID: {u._id.substring(0, 6)}...</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-gray-600">
                    {u.email}
                  </td>
                  <td className="py-4 px-6 text-center">
                    <span className="inline-flex px-2 py-1 rounded bg-gray-100 text-gray-700 text-xs font-mono">
                      {u.sessions || 0}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-gray-600">
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-gray-400" />
                      {new Date(u.createdAt || u.joined || Date.now()).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${u.status === "Active"
                      ? "bg-green-50 text-green-700 border-green-100"
                      : "bg-red-50 text-red-700 border-red-100"
                      }`}>
                      {u.status === "Active" ? <Shield size={12} /> : <ShieldAlert size={12} />}
                      {u.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button
                      onClick={() => toggleStatus(u._id, u.status)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors border ${u.status === "Active"
                        ? "bg-white text-red-600 border-red-200 hover:bg-red-50"
                        : "bg-white text-green-600 border-green-200 hover:bg-green-50"
                        }`}
                    >
                      {u.status === "Active" ? "Block Access" : "Unblock User"}
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="py-20 text-center text-gray-500">
                  No users found matching your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {!loading && sorted.length > 0 && (
        <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-4">
          <span className="text-sm text-gray-500">
            Showing {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, sorted.length)} of {sorted.length}
          </span>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
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
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className={`p-2 rounded-lg border ${page === totalPages ? 'border-gray-100 text-gray-300 cursor-not-allowed' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersTable;