import { useEffect, useState } from "react";
import { ConversationList } from "../components/ConversationList";
import { listConversations, type Conversation } from "../api/conversations";
import { ArrowUpRight, History, MessageCircle } from "lucide-react";
export function ConversationHistoryPage() {
	const [conversations, setConversations] = useState<Conversation[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	useEffect(() => {
		listConversations().then(setConversations).catch(reason => setError(reason instanceof Error ? reason.message : "Conversations could not be loaded.")).finally(() => setLoading(false));
	}, []);
	return <div className="min-h-[calc(100vh-1px)] px-5 py-6 sm:px-8 lg:px-12 lg:py-10"><div className="mx-auto max-w-5xl"><header className="mb-9"><p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-coral">Archive</p><h1 className="font-display text-4xl font-semibold tracking-tight text-white">Past investigations.</h1><p className="mt-3 text-slate-400">Return to the questions that shaped your research.</p></header><section className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 sm:p-7">{loading && <div className="flex items-center gap-3 py-12 text-sm text-slate-400"><History className="animate-pulse text-coral" size={18} />Loading conversations...</div>}{error && <div role="alert" className="rounded-lg border border-coral/30 bg-coral/10 px-3 py-2 text-sm text-coral">{error}</div>}{!loading && !error && (conversations.length === 0 ? <div className="py-12 text-center"><MessageCircle className="mx-auto mb-3 text-slate-600" size={27} /><p className="text-sm text-slate-400">No investigations yet.</p></div> : <div className="divide-y divide-white/5">{conversations.map(conversation => <a className="group flex items-center gap-4 py-4 first:pt-0 last:pb-0" href={`/chat/${encodeURIComponent(conversation._id)}`} key={conversation._id}><span className="grid h-10 w-10 place-items-center rounded-xl bg-white/5 text-slate-500 transition group-hover:bg-coral/10 group-hover:text-coral"><MessageCircle size={18} /></span><span className="min-w-0 flex-1"><span className="block truncate font-medium text-slate-200 group-hover:text-white">{conversation.title ?? "Untitled conversation"}</span><span className="text-xs text-slate-600">Open saved conversation</span></span><ArrowUpRight size={17} className="text-slate-600 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-coral" /></a>)}</div>)}</section></div></div>;
}
