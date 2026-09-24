import { Link } from "react-router-dom";
import { ArrowUpRight, MessageCircle } from "lucide-react";
import type { Conversation } from "../api/conversations";

export function ConversationList({ conversations }: { conversations: Conversation[] }) {
	if (conversations.length === 0) return <p>No conversations yet.</p>;
	return <ul className="divide-y divide-white/5">{conversations.map(conversation => <li key={conversation._id}><Link className="group flex items-center gap-4 py-4 first:pt-0 last:pb-0" to={`/chat/${encodeURIComponent(conversation._id)}`}><span className="grid h-10 w-10 place-items-center rounded-xl bg-white/5 text-slate-500 transition group-hover:bg-coral/10 group-hover:text-coral"><MessageCircle size={18} /></span><span className="min-w-0 flex-1"><span className="block truncate font-medium text-slate-200 group-hover:text-white">{conversation.title ?? "Untitled conversation"}</span><span className="text-xs text-slate-600">Open saved conversation</span></span><ArrowUpRight size={17} className="text-slate-600 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-coral" /></Link></li>)}</ul>;
}
