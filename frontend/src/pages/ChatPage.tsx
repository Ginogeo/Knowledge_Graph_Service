import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getConversation } from "../api/conversations";
import { useQuestionStream, type StreamMessage } from "../hooks/useQuestionStream";
import { ChatMessage } from "../components/ChatMessage";
import { SourceCitation } from "../components/SourceCitation";
import type { ConversationTurn } from "../api/conversations";
import { ArrowUp, BrainCircuit, LoaderCircle, Sparkles } from "lucide-react";

export function ChatPage() {
	const { conversationId = "default" } = useParams();
	const [text, setText] = useState("");
	const [initialMessages, setInitialMessages] = useState<StreamMessage[]>([]);
	const [conversationReady, setConversationReady] = useState(conversationId === "default");
	const [loadError, setLoadError] = useState<string | null>(null);
	const { messages, sendQuestion, isStreaming, error } = useQuestionStream(conversationId, initialMessages, conversationReady);

	useEffect(() => {
		if (conversationId === "default") {
			setInitialMessages([]);
			setConversationReady(true);
			return;
		}
		let active = true;
		setConversationReady(false);
		setLoadError(null);
		getConversation(conversationId)
			.then((conversation) => {
				if (!active) return;
				setInitialMessages((conversation.turns ?? []).flatMap((turn: ConversationTurn) => [
					{ role: "user", content: turn.question },
					{ role: "assistant", content: turn.answer, sources: turn.sources as StreamMessage["sources"] ?? [] }
				]));
				setConversationReady(true);
			})
			.catch((reason: unknown) => {
				if (active) { setLoadError(reason instanceof Error ? reason.message : "Conversation could not be loaded."); setConversationReady(false); }
			});
		return () => { active = false; };
	}, [conversationId]);

	return <div className="min-h-[calc(100vh-1px)] px-5 py-6 sm:px-8 lg:px-12 lg:py-10"><div className="mx-auto max-w-5xl"><header className="mb-10 flex items-start justify-between"><div><p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-coral"><span className="h-2 w-2 rounded-full bg-coral" />Research desk</p><h1 className="font-display text-4xl font-semibold tracking-tight text-white sm:text-5xl">Ask the graph.</h1><p className="mt-3 max-w-xl text-base leading-7 text-slate-400">Connect the dots across your documents, entities, and market context.</p></div><div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-slate-400 sm:flex"><BrainCircuit size={15} className="text-mint" />Context-aware</div></header>{loadError && <div role="alert" className="mb-6 rounded-xl border border-coral/30 bg-coral/10 px-4 py-3 text-sm text-coral">{loadError}</div>}<section className="min-h-[48vh] space-y-6">{messages.length === 0 && !loadError && <div className="grid min-h-[42vh] place-items-center rounded-3xl border border-dashed border-white/10 bg-white/[0.02] p-8 text-center"><div><div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-2xl border border-mint/20 bg-mint/10 text-mint"><Sparkles size={24} /></div><h2 className="font-display text-2xl font-semibold text-white">What are you investigating?</h2><p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">Ask about companies, documents, relationships, or events in your knowledge base.</p></div></div>}{messages.map((message, index) => <div className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`} key={`${message.role}-${index}`}><div className={message.role === "user" ? "max-w-2xl rounded-2xl rounded-br-md bg-coral px-5 py-4 text-ink shadow-glow" : "max-w-3xl rounded-2xl rounded-bl-md border border-white/10 bg-white/[0.05] px-5 py-4 text-slate-200"}><ChatMessage {...message} />{message.sources && message.sources.length > 0 && <div className="mt-4 border-t border-white/10 pt-3"><p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">Sources</p>{message.sources.map((source, sourceIndex) => <SourceCitation key={sourceIndex} source={source} />)}</div>}</div></div>)}</section><form className="sticky bottom-5 mt-8" onSubmit={event => { event.preventDefault(); if (text.trim()) { sendQuestion(text); setText(""); } }}><div className="flex items-end gap-3 rounded-2xl border border-white/10 bg-ink-soft/90 p-3 shadow-2xl shadow-black/20 backdrop-blur-xl"><textarea rows={2} disabled={isStreaming || !conversationReady} value={text} onChange={event => setText(event.target.value)} placeholder={conversationReady ? "Ask a question about your knowledge base..." : "Loading conversation..."} className="min-h-[52px] flex-1 resize-none bg-transparent px-3 py-2 text-sm leading-6 text-white outline-none placeholder:text-slate-600" /><button disabled={isStreaming || !conversationReady || !text.trim()} aria-label="Send question" className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-coral text-ink transition hover:bg-[#ff9b72] disabled:cursor-not-allowed disabled:opacity-40" type="submit">{isStreaming ? <LoaderCircle className="animate-spin" size={18} /> : <ArrowUp size={19} />}</button></div>{error && <p role="alert" className="mt-2 px-3 text-sm text-coral">{error}</p>}</form></div></div>;
}
