"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const fetchUser = async () => {
            const token = localStorage.getItem("token");
            if (!token) {
                if (pathname !== "/") router.push("/");
                setLoading(false);
                return;
            }
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (!res.ok) {
                    localStorage.removeItem("token");
                    throw new Error("Session expired");
                }
                const userData = await res.json();
                setUser(userData);
            } catch (err) {
                if (pathname !== "/") router.push("/");
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, [pathname, router]);

    return (
        <AuthContext.Provider value={{ user, setUser, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
