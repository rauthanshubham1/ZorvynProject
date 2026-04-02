"use client";
import { useEffect, useState } from "react";

export default function DashboardOverview() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchSummary = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/dashboard/summary`, {
                headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
            });
            if (!res.ok) throw new Error("Failed to fetch summary");
            const json = await res.json();
            setData(json);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSummary();
    }, []);

    if (loading) return (
        <div className="flex h-64 items-center justify-center">
            <div className="text-xl text-neutral-400 animate-pulse font-display">Loading dashboard data...</div>
        </div>
    );
    if (error) return <div className="text-red-400 glass-panel p-6 rounded-2xl border-red-500/20">{error}</div>;

    return (
        <div className="space-y-10">
            <header className="mb-4">
                <h1 className="text-4xl font-display font-bold text-white mb-2 tracking-tight">Financial Overview</h1>
                <p className="text-neutral-400 text-lg">Metrics across all your accounts and recent transactions.</p>
            </header>

            {/* Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-panel p-8 rounded-[2rem] relative overflow-hidden group transition-all duration-500 hover:-translate-y-1">
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-green-500/20 rounded-full blur-3xl group-hover:bg-green-500/30 transition-all duration-500" />
                    <h3 className="text-sm font-medium text-neutral-400 mb-2 uppercase tracking-wider">Total Income</h3>
                    <p className="text-5xl font-bold text-white tracking-tight">${data?.income?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                </div>
                <div className="glass-panel p-8 rounded-[2rem] relative overflow-hidden group transition-all duration-500 hover:-translate-y-1">
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-red-500/20 rounded-full blur-3xl group-hover:bg-red-500/30 transition-all duration-500" />
                    <h3 className="text-sm font-medium text-neutral-400 mb-2 uppercase tracking-wider">Total Expenses</h3>
                    <p className="text-5xl font-bold text-white tracking-tight">${data?.expense?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                </div>
                <div className="glass-panel p-8 rounded-[2rem] relative overflow-hidden group transition-all duration-500 hover:-translate-y-1">
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl group-hover:bg-blue-500/30 transition-all duration-500" />
                    <h3 className="text-sm font-medium text-neutral-400 mb-2 uppercase tracking-wider">Net Balance</h3>
                    <p className="text-5xl font-bold text-white tracking-tight">${data?.net?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Category Totals */}
                <div className="glass-panel p-8 rounded-[2rem]">
                    <h3 className="text-2xl font-display font-medium text-white mb-6">Spending by Category</h3>
                    <div className="space-y-3">
                        {data?.categoryTotals && Object.keys(data.categoryTotals).length > 0 ? (
                            Object.entries(data.categoryTotals).map(([cat, total]) => (
                                <div key={cat} className="flex items-center justify-between p-5 bg-white/[0.03] rounded-2xl hover:bg-white/[0.06] transition-colors border border-white/5">
                                    <span className="text-neutral-300 font-medium">{cat}</span>
                                    <span className="text-white font-bold text-lg">${Number(total).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                </div>
                            ))
                        ) : (
                            <p className="text-neutral-500 italic p-4 text-center">No category data available.</p>
                        )}
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="glass-panel p-8 rounded-[2rem]">
                    <h3 className="text-2xl font-display font-medium text-white mb-6">Recent Activity</h3>
                    <div className="space-y-3">
                        {data?.recentActivity?.length > 0 ? (
                            data.recentActivity.map((record) => (
                                <div key={record.id} className="flex items-center justify-between p-5 bg-white/[0.03] rounded-2xl hover:bg-white/[0.06] transition-colors border border-white/5">
                                    <div>
                                        <p className="text-white font-medium text-lg">{record.category}</p>
                                        <p className="text-sm text-neutral-400">{record.date}</p>
                                    </div>
                                    <div className={`font-bold text-xl ${record.type === 'INCOME' ? 'text-green-400' : 'text-red-400'}`}>
                                        {record.type === 'INCOME' ? '+' : '-'}${record.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-neutral-500 italic p-4 text-center">No recent activity found.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
