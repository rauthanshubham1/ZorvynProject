"use client";
import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";

export default function RecordsPage() {
    const { user } = useAuth();
    const isAdmin = user?.roles?.some(r => r.name === 'ADMIN');
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [filterType, setFilterType] = useState("");
    const [filterCategory, setFilterCategory] = useState("");
    const [search, setSearch] = useState("");

    const [page, setPage] = useState(0);
    const [size, setSize] = useState(10);
    const [sortBy, setSortBy] = useState("date");
    const [sortDir, setSortDir] = useState("desc");
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    const [showForm, setShowForm] = useState(false);
    const [editingRecord, setEditingRecord] = useState(null);
    const [formLoad, setFormLoad] = useState(false);
    const [newReq, setNewReq] = useState({
        amount: "", type: "EXPENSE", category: "Groceries", date: new Date().toISOString().split('T')[0], notes: ""
    });

    const fetchRecords = async () => {
        try {
            setLoading(true);
            const q = new URLSearchParams();
            if (filterType) q.append("type", filterType);
            if (filterCategory) q.append("category", filterCategory);
            if (search) q.append("search", search);
            q.append("page", page.toString());
            q.append("size", size.toString());
            q.append("sortBy", sortBy);
            q.append("sortDir", sortDir);

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/records?${q.toString()}`, {
                headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
            });

            if (!res.ok) throw new Error("Failed to fetch records");
            const data = await res.json();
            setRecords(data.content || []);
            setTotalPages(data.totalPages || 0);
            setTotalElements(data.totalElements || 0);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRecords();
    }, [filterType, filterCategory, search, page, sortBy, sortDir]);

    const handleAdd = async (e) => {
        e.preventDefault();
        setFormLoad(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/records`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                },
                body: JSON.stringify({
                    ...newReq,
                    amount: parseFloat(newReq.amount)
                })
            });
            if (!res.ok) throw new Error("Failed to add record (Requires ADMIN/ANALYST role)");
            setShowForm(false);
            setNewReq({ ...newReq, amount: "", notes: "" });
            fetchRecords();
        } catch (err) {
            alert(err.message);
        } finally {
            setFormLoad(false);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setFormLoad(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/records/${editingRecord.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                },
                body: JSON.stringify({
                    amount: parseFloat(editingRecord.amount),
                    type: editingRecord.type,
                    category: editingRecord.category,
                    date: editingRecord.date,
                    notes: editingRecord.notes
                })
            });
            if (!res.ok) throw new Error("Update failed (Requires ADMIN role)");
            setEditingRecord(null);
            fetchRecords();
        } catch (err) {
            alert(err.message);
        } finally {
            setFormLoad(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Delete this record?")) return;
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/records/${id}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
            });
            if (!res.ok) throw new Error("Delete failed (Requires ADMIN role)");
            fetchRecords();
        } catch (err) {
            alert(err.message);
        }
    };

    return (
        <div className="space-y-8">
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-display font-bold text-white mb-2 tracking-tight">Records</h1>
                    <p className="text-neutral-400 text-lg">Manage your entire transaction history.</p>
                </div>
                {isAdmin && (
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="px-6 py-3 rounded-2xl bg-white text-black font-semibold hover:bg-neutral-200 transition-colors shadow-lg active:scale-95"
                    >
                        {showForm ? "Cancel" : "+ Add Record"}
                    </button>
                )}
            </header>

            {showForm && (
                <form onSubmit={handleAdd} className="glass-panel p-8 rounded-[2rem] animate-fade-in-up border-blue-500/30">
                    <h2 className="text-2xl font-display font-medium text-white mb-6">New Transaction</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-neutral-300">Type</label>
                            <select className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white" value={newReq.type} onChange={e => setNewReq({ ...newReq, type: e.target.value })}>
                                <option value="EXPENSE" className="bg-neutral-900">Expense</option>
                                <option value="INCOME" className="bg-neutral-900">Income</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-neutral-300">Amount</label>
                            <input type="number" step="0.01" required className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-neutral-600" placeholder="0.00" value={newReq.amount} onChange={e => setNewReq({ ...newReq, amount: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-neutral-300">Category</label>
                            <input type="text" required className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white" placeholder="e.g. Groceries" value={newReq.category} onChange={e => setNewReq({ ...newReq, category: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-neutral-300">Date</label>
                            <input type="date" required className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white" value={newReq.date} onChange={e => setNewReq({ ...newReq, date: e.target.value })} />
                        </div>
                        <div className="space-y-2 sm:col-span-2">
                            <label className="text-sm font-medium text-neutral-300">Notes</label>
                            <input type="text" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white" placeholder="Optional notes..." value={newReq.notes} onChange={e => setNewReq({ ...newReq, notes: e.target.value })} />
                        </div>
                    </div>
                    <div className="mt-8 flex justify-end">
                        <button disabled={formLoad} className="px-8 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all">
                            {formLoad ? "Saving..." : "Save Record"}
                        </button>
                    </div>
                </form>
            )}

            {editingRecord && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <form onSubmit={handleUpdate} className="glass-panel p-8 rounded-[2rem] w-full max-w-2xl border-purple-500/30 relative">
                        <button type="button" onClick={() => setEditingRecord(null)} className="absolute top-6 right-6 text-neutral-500 hover:text-white transition-colors">✕</button>
                        <h2 className="text-2xl font-display font-medium text-white mb-6">Edit Transaction</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-neutral-300">Type</label>
                                <select className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white" value={editingRecord.type} onChange={e => setEditingRecord({ ...editingRecord, type: e.target.value })}>
                                    <option value="EXPENSE" className="bg-neutral-900">Expense</option>
                                    <option value="INCOME" className="bg-neutral-900">Income</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-neutral-300">Amount</label>
                                <input type="number" step="0.01" required className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white" value={editingRecord.amount} onChange={e => setEditingRecord({ ...editingRecord, amount: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-neutral-300">Category</label>
                                <input type="text" required className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white" value={editingRecord.category} onChange={e => setEditingRecord({ ...editingRecord, category: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-neutral-300">Date</label>
                                <input type="date" required className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white" value={editingRecord.date} onChange={e => setEditingRecord({ ...editingRecord, date: e.target.value })} />
                            </div>
                            <div className="space-y-2 sm:col-span-2">
                                <label className="text-sm font-medium text-neutral-300">Notes</label>
                                <input type="text" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white" value={editingRecord.notes} onChange={e => setEditingRecord({ ...editingRecord, notes: e.target.value })} />
                            </div>
                        </div>
                        <div className="mt-8 flex justify-end gap-4">
                            <button type="button" onClick={() => setEditingRecord(null)} className="px-8 py-3 rounded-xl text-neutral-400 hover:text-white transition-colors">Cancel</button>
                            <button disabled={formLoad} className="px-8 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all">
                                {formLoad ? "Updating..." : "Update Record"}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="glass-panel rounded-[2rem] overflow-hidden">
                {/* Filters */}
                <div className="p-4 border-b border-white/5 bg-white/[0.02] flex flex-col xl:flex-row gap-4 justify-between animate-fade-in-up delay-75">
                    <div className="flex flex-wrap gap-4">
                        <input type="text" placeholder="Search notes or category..." value={search} onChange={e => { setSearch(e.target.value); setPage(0); }} className="px-4 py-2.5 rounded-xl bg-neutral-900 border border-white/10 text-sm text-white placeholder:text-neutral-500 outline-none focus:ring-2 focus:ring-blue-500/50 w-full sm:w-64" />
                        <select value={filterType} onChange={e => { setFilterType(e.target.value); setPage(0); }} className="px-4 py-2.5 rounded-xl bg-neutral-900 border border-white/10 text-sm text-white outline-none focus:ring-2 focus:ring-blue-500/50">
                            <option value="">All Types</option>
                            <option value="INCOME">Income</option>
                            <option value="EXPENSE">Expense</option>
                        </select>
                        <input type="text" placeholder="Category filter..." value={filterCategory} onChange={e => { setFilterCategory(e.target.value); setPage(0); }} className="px-4 py-2.5 rounded-xl bg-neutral-900 border border-white/10 text-sm text-white placeholder:text-neutral-500 outline-none focus:ring-2 focus:ring-blue-500/50" />
                    </div>
                    <div className="flex gap-4">
                        <select value={sortBy} onChange={(e) => { setSortBy(e.target.value); setPage(0); }} className="px-4 py-2.5 bg-neutral-900 border border-white/10 rounded-xl text-white outline-none focus:ring-2 focus:ring-blue-500/50">
                            <option value="date">Sort by Date</option>
                            <option value="amount">Sort by Amount</option>
                            <option value="category">Sort by Category</option>
                        </select>
                        <button onClick={() => { setSortDir(sortDir === 'asc' ? 'desc' : 'asc'); setPage(0); }} className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition-colors font-medium">
                            {sortDir === 'asc' ? '↑ Ascending' : '↓ Descending'}
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/5 text-sm text-neutral-400">
                                <th className="p-6 font-medium">Date</th>
                                <th className="p-6 font-medium">Category</th>
                                <th className="p-6 font-medium">Notes</th>
                                <th className="p-6 font-medium text-right">Amount</th>
                                <th className="p-6 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="5" className="p-12 text-center text-neutral-500 animate-pulse">Loading records...</td></tr>
                            ) : records.length === 0 ? (
                                <tr><td colSpan="5" className="p-12 text-center text-neutral-500">No records found.</td></tr>
                            ) : (
                                records.map(r => (
                                    <tr key={r.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                                        <td className="p-6 text-neutral-300">{r.date}</td>
                                        <td className="p-6">
                                            <span className="px-3 py-1 rounded-full bg-white/5 text-sm text-white border border-white/5">{r.category}</span>
                                        </td>
                                        <td className="p-6 text-neutral-400 text-sm">{r.notes || "-"}</td>
                                        <td className={`p-6 text-right font-medium text-lg ${r.type === 'INCOME' ? 'text-green-400' : 'text-red-400'}`}>
                                            {r.type === 'INCOME' ? '+' : '-'}${r.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </td>
                                        <td className="p-6 text-right">
                                            {isAdmin && (
                                                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => setEditingRecord({ ...r })} className="text-sm px-3 py-1.5 rounded-lg text-neutral-500 hover:text-white hover:bg-white/10 transition-colors">
                                                        Edit
                                                    </button>
                                                    <button onClick={() => handleDelete(r.id)} className="text-sm px-3 py-1.5 rounded-lg text-neutral-500 hover:text-white hover:bg-red-500/20 transition-colors">
                                                        Delete
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                {/* Pagination */}
                <div className="p-4 border-t border-white/5 flex items-center justify-between bg-white/[0.02]">
                    <span className="text-sm text-neutral-400 font-medium">
                        Showing page <span className="text-white">{page + 1}</span> of <span className="text-white">{totalPages || 1}</span> <span className="opacity-50">({totalElements} total elements)</span>
                    </span>
                    <div className="flex gap-2">
                        <button disabled={page === 0} onClick={() => setPage(page - 1)} className="px-6 py-2 bg-white/5 border border-white/10 rounded-lg text-white hover:bg-white/10 transition-colors disabled:opacity-30 font-medium">Prev</button>
                        <button disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)} className="px-6 py-2 bg-white/5 border border-white/10 rounded-lg text-white hover:bg-white/10 transition-colors disabled:opacity-30 font-medium">Next</button>
                    </div>
                </div>
            </div>
            {error && <p className="text-red-400 text-center">{error}</p>}
        </div>
    );
}
