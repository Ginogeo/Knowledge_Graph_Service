import { createContext, useEffect, useState, type ReactNode } from "react";
import * as auth from "../api/auth";
import type { User } from "../api/auth";
export const AuthContext = createContext<{ user: User | null; ready: boolean; login: typeof auth.login; register: typeof auth.register; logout: () => Promise<void> }>({ user: null, ready: false, login: auth.login, register: auth.register, logout: async () => undefined });
export function AuthProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useState<User | null>(null);
	const [ready, setReady] = useState(false);
	useEffect(() => {
		auth.restore().then(result => setUser(result?.user ?? null)).catch(() => setUser(null)).finally(() => setReady(true));
	}, []);
	return <AuthContext.Provider value={{ user, ready, login: async (...args) => { const result = await auth.login(...args); setUser(result.user); return result; }, register: async (...args) => { const result = await auth.register(...args); setUser(result.user); return result; }, logout: async () => { await auth.logout(); setUser(null); } }}>{children}</AuthContext.Provider>;
}
