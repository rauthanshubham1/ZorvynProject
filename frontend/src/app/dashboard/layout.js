"use client";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";

export default function DashboardLayout({ children }) {
    const router = useRouter();
    const pathname = usePathname();
    const { user } = useAuth();
    const isAdmin = user?.roles?.some(r => r.name === 'ADMIN');
    const isViewer = user?.roles?.every(r => r.name === 'VIEWER');

    const handleLogout = () => {
        localStorage.removeItem("token");
        router.push("/");
    };

    const navs = [
        { name: "Overview", path: "/dashboard" }
    ];
    if (!isViewer || isAdmin) {
        navs.push({ name: "Records", path: "/dashboard/records" });
    }
    if (isAdmin) {
        navs.push({ name: "Users", path: "/dashboard/users" });
    }

    return (
        <div className="flex h-screen overflow-hidden">
            {/* Sidebar */}
            <aside className="w-64 glass-panel border-r border-white/5 rounded-none flex flex-col z-20">
                <div className="p-8">
                    <h2 className="text-3xl font-display font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400 tracking-tight">
                        Zorvyn
                    </h2>
                </div>
                <nav className="flex-1 px-4 space-y-2 mt-4">
                    {navs.map((n) => {
                        const active = pathname === n.path;
                        return (
                            <Link key={n.path} href={n.path}
                                className={`block px-4 py-3.5 rounded-2xl transition-all duration-300 ${active ? "bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-white font-medium border border-white/10" : "text-neutral-400 hover:bg-white/5 hover:text-white border border-transparent"}`}
                            >
                                {n.name}
                            </Link>
                        )
                    })}
                </nav>
                <div className="p-4 border-t border-white/5">
                    <button onClick={handleLogout} className="w-full px-4 py-3.5 text-left text-neutral-400 hover:text-red-400 hover:bg-red-500/10 rounded-2xl transition-all duration-300 font-medium">
                        Log Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto p-8 lg:p-12 relative bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/10 via-[#0a0a0a] to-[#000000]">
                <div className="max-w-6xl mx-auto relative z-10 animate-fade-in-up">
                    {children}
                </div>
            </main>
        </div>
    );
}
