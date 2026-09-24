import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
export function ProtectedRoute() { const { user, ready } = useAuth(); if (!ready) return <main className="grid min-h-screen place-items-center bg-ink text-slate-300"><p className="animate-pulse text-sm">Restoring your workspace...</p></main>; return user ? <Outlet /> : <Navigate to="/login" replace />; }
