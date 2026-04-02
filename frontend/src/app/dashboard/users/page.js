"use client";
import { useEffect, useState } from "react";

export default function UsersPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [formLoad, setFormLoad] = useState(false);

    const [search, setSearch] = useState("");
    const [page, setPage] = useState(0);
    const [size, setSize] = useState(10);
    const [sortBy, setSortBy] = useState("id");
    const [sortDir, setSortDir] = useState("asc");
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    const [newUser, setNewUser] = useState({
        name: "", email: "", password: "", role: "VIEWER"
    });

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const q = new URLSearchParams({ search, page, size, sortBy, sortDir });
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/users?${q}`, {
                headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
            });
            if (!res.ok) throw new Error("Failed to fetch users (Access Restricted - Requires ADMIN)");

            const data = await res.json();
            setUsers(data.content || []);
            setTotalPages(data.totalPages || 0);
            setTotalElements(data.totalElements || 0);
            setError("");
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [search, page, sortBy, sortDir]);

    const handleCreate = async (e) => {
        e.preventDefault();
        setFormLoad(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/users`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                },
                body: JSON.stringify(newUser)
            });
            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.error || "Failed to create user");
            }
            setShowForm(false);
            setNewUser({ name: "", email: "", password: "", role: "VIEWER" });
            fetchUsers();
        } catch (err) {
            alert(err.message);
        } finally {
            setFormLoad(false);
        }
    };

    const updateStatus = async (id, status) => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/users/${id}/status?status=${status}`, {
                method: "PUT",
                headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
            });
            if (!res.ok) throw new Error("Status update failed");
            fetchUsers();
        } catch (err) {
            alert(err.message);
        }
    };

    const updateRole = async (id, roleName) => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/users/${id}/roles`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                },
                body: JSON.stringify([roleName])
            });
            if (!res.ok) throw new Error("Role update failed");
            fetchUsers();
        } catch (err) {
            alert(err.message);
        }
    };

    return (
        <div className="space-y-8 animate-fade-in-up">
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-display font-bold text-white mb-2 tracking-tight">Users</h1>
                    <p className="text-neutral-400 text-lg">Manage system users, roles, and access.</p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="px-6 py-3 rounded-2xl bg-white text-black font-semibold hover:bg-neutral-200 transition-colors shadow-lg active:scale-95"
                >
                    {showForm ? "Cancel" : "+ New User"}
                </button>
            </header>

            <div className="glass-panel p-4 rounded-2xl flex flex-col sm:flex-row gap-4 items-center justify-between animate-fade-in-up delay-75">
                <input
                    type="text"
                    placeholder="Search by name or email..."
                    className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:ring-2 focus:ring-purple-500/50 w-full sm:w-72"
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                />
                <div className="flex gap-4">
                    <select value={sortBy} onChange={(e) => { setSortBy(e.target.value); setPage(0); }} className="px-4 py-2.5 bg-neutral-900 border border-white/10 rounded-xl text-white outline-none focus:ring-2 focus:ring-purple-500/50">
                        <option value="id">Sort by ID</option>
                        <option value="name">Sort by Name</option>
                        <option value="email">Sort by Email</option>
                    </select>
                    <button onClick={() => { setSortDir(sortDir === 'asc' ? 'desc' : 'asc'); setPage(0); }} className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition-colors font-medium">
                        {sortDir === 'asc' ? '↑ Ascending' : '↓ Descending'}
                    </button>
                </div>
            </div>

            {error ? (
                <div className="text-red-400 glass-panel p-6 rounded-2xl border-red-500/20">{error}</div>
            ) : (
                <>
                    {showForm && (
                        <form onSubmit={handleCreate} className="glass-panel p-8 rounded-[2rem] animate-fade-in-up border-purple-500/30 mb-8 overflow-hidden relative">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-[80px] pointer-events-none" />
                            <h2 className="text-2xl font-display font-medium text-white mb-6">Create User</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 relative z-10">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-neutral-300">Name</label>
                                    <input type="text" required className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50" value={newUser.name} onChange={e => setNewUser({ ...newUser, name: e.target.value })} placeholder="Full Name" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-neutral-300">Email</label>
                                    <input type="email" required className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50" value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} placeholder="user@example.com" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-neutral-300">Password</label>
                                    <input type="password" required className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50" value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} placeholder="••••••••" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-neutral-300">Initial Role</label>
                                    <select className="w-full px-4 py-3 rounded-xl bg-neutral-900 border border-white/10 text-white appearance-none focus:outline-none focus:ring-2 focus:ring-purple-500/50" value={newUser.role} onChange={e => setNewUser({ ...newUser, role: e.target.value })}>
                                        <option value="VIEWER">Viewer</option>
                                        <option value="ANALYST">Analyst</option>
                                        <option value="ADMIN">Admin</option>
                                    </select>
                                </div>
                            </div>
                            <div className="mt-8 flex justify-end relative z-10">
                                <button disabled={formLoad} className="px-8 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium hover:shadow-lg hover:shadow-purple-500/25 transition-all">
                                    {formLoad ? "Creating..." : "Create Account"}
                                </button>
                            </div>
                        </form>
                    )}

                    <div className="glass-panel rounded-[2rem] overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-white/5 text-sm text-neutral-400 bg-white/[0.02]">
                                        <th className="p-6 font-medium">Name</th>
                                        <th className="p-6 font-medium">Email</th>
                                        <th className="p-6 font-medium">Status</th>
                                        <th className="p-6 font-medium">Role</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr><td colSpan="4" className="p-12 text-center text-neutral-500 animate-pulse font-display">Loading network directory...</td></tr>
                                    ) : users.length === 0 ? (
                                        <tr><td colSpan="4" className="p-12 text-center text-neutral-500">No users found.</td></tr>
                                    ) : (
                                        users.map(u => {
                                            const roleName = u.roles?.length > 0 ? u.roles[0].name : "VIEWER";
                                            return (
                                                <tr key={u.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                                                    <td className="p-6 text-white font-medium text-lg">{u.name}</td>
                                                    <td className="p-6 text-neutral-400">{u.email}</td>
                                                    <td className="p-6">
                                                        <select
                                                            value={u.status || "ACTIVE"}
                                                            onChange={e => updateStatus(u.id, e.target.value)}
                                                            className={`text-sm px-4 py-2 rounded-full border outline-none font-medium ${u.status === 'ACTIVE' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'} appearance-none cursor-pointer focus:ring-2`}
                                                        >
                                                            <option value="ACTIVE" className="bg-neutral-900 text-white">Active</option>
                                                            <option value="INACTIVE" className="bg-neutral-900 text-white">Inactive</option>
                                                        </select>
                                                    </td>
                                                    <td className="p-6">
                                                        <select
                                                            value={roleName}
                                                            onChange={e => updateRole(u.id, e.target.value)}
                                                            className="px-4 py-2 flex items-center min-w-[120px] rounded-xl bg-neutral-900 border border-white/10 text-sm font-medium text-white outline-none focus:ring-2 focus:ring-purple-500/50 cursor-pointer"
                                                        >
                                                            <option value="VIEWER">Viewer</option>
                                                            <option value="ANALYST">Analyst</option>
                                                            <option value="ADMIN">Admin</option>
                                                        </select>
                                                    </td>
                                                </tr>
                                            )
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
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
                </>
            )}
        </div>
    );
}
