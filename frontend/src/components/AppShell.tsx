import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { FileText, History, LogOut, MessageSquare, Network, Plus } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

const navItems = [
  { to: "/chat", label: "Ask the graph", icon: MessageSquare },
  { to: "/documents", label: "Knowledge library", icon: FileText },
  { to: "/conversations", label: "Conversation history", icon: History }
];

export function AppShell() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  return <div className="min-h-screen bg-ink text-slate-100 lg:grid lg:grid-cols-[264px_1fr]">
    <aside className="border-b border-white/10 bg-ink-soft/80 px-5 py-5 backdrop-blur-xl lg:flex lg:min-h-screen lg:flex-col lg:border-b-0 lg:border-r lg:px-6">
      <div className="flex items-center justify-between lg:block">
        <NavLink to="/chat" className="group flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-coral text-ink shadow-glow"><Network size={21} strokeWidth={2.5} /></span>
          <span><span className="block font-display text-lg font-bold tracking-tight">Nexus</span><span className="block text-[10px] uppercase tracking-[0.24em] text-slate-500">Financial intelligence</span></span>
        </NavLink>
      </div>
      <nav className="mt-8 flex gap-2 overflow-x-auto lg:block lg:space-y-2" aria-label="Main navigation">
        {navItems.map(({ to, label, icon: Icon }) => <NavLink key={to} to={to} className={({ isActive }) => `flex min-w-max items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${isActive ? "bg-white/10 text-white shadow-inner" : "text-slate-400 hover:bg-white/5 hover:text-white"}`}><Icon size={18} />{label}</NavLink>)}
      </nav>
      <div className="mt-auto hidden rounded-2xl border border-white/10 bg-white/[0.03] p-4 lg:block">
        <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500"><span className="h-2 w-2 rounded-full bg-mint" />System online</div>
        <p className="text-sm leading-6 text-slate-400">Your private research workspace is ready for questions.</p>
        <button onClick={() => navigate("/chat")} className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/15"><Plus size={16} />New question</button>
      </div>
      <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4 lg:mt-5">
        <div className="min-w-0"><p className="truncate text-sm font-semibold text-white">{user?.email ?? "Analyst"}</p><p className="text-xs text-slate-500">{user?.role ?? "user"} access</p></div>
        <button aria-label="Sign out" title="Sign out" onClick={() => void logout()} className="rounded-lg p-2 text-slate-500 transition hover:bg-white/10 hover:text-white"><LogOut size={17} /></button>
      </div>
    </aside>
    <main className="relative overflow-hidden"><div className="pointer-events-none absolute inset-0 bg-grid opacity-40" /><div className="relative"><Outlet /></div></main>
  </div>;
}
