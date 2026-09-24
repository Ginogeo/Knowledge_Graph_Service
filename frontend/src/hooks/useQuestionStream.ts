import { useEffect, useRef, useState } from "react";
import { getAccessToken } from "../api/client";
import type { CitationSource } from "../components/SourceCitation";
export type StreamMessage = { role: "user" | "assistant"; content: string; sources?: CitationSource[] };
export function useQuestionStream(conversationId: string, initialMessages: StreamMessage[] = [], enabled = true) {
	const socket = useRef<WebSocket | null>(null);
	const pendingQuestions = useRef<string[]>([]);
	const [messages, setMessages] = useState<StreamMessage[]>(initialMessages);
	const [isStreaming, setStreaming] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		setMessages(initialMessages);
	}, [initialMessages]);

	useEffect(() => {
		if (!enabled) return;
		const url = `${import.meta.env.VITE_WS_BASE_URL}/ws/questions?token=${encodeURIComponent(getAccessToken() ?? "")}&conversationId=${encodeURIComponent(conversationId)}`;
		const connection = new WebSocket(url);
		socket.current = connection;
		connection.onopen = () => {
			const pending = pendingQuestions.current.splice(0);
			pending.forEach(text => connection.send(JSON.stringify({ type: "question", text })));
		};
		connection.onmessage = event => {
			const message = JSON.parse(event.data);
				if (message.type === "token") {
				setMessages(current => { const last = current[current.length - 1]; if (last?.role === "assistant") return [...current.slice(0, -1), { ...last, content: last.content + message.content }]; return [...current, { role: "assistant", content: message.content }]; });
			}
			if (message.type === "done") {
				setStreaming(false);
				setMessages(current => { const last = current[current.length - 1]; return last ? [...current.slice(0, -1), { ...last, sources: message.sources }] : current; });
			}
			if (message.type === "error") { setStreaming(false); setError("The answer could not be generated. Please try again."); }
		};
		connection.onerror = () => { setStreaming(false); setError("Question stream could not connect."); };
		connection.onclose = () => { setStreaming(false); if (socket.current === connection) socket.current = null; };
		return () => { connection.close(); if (socket.current === connection) socket.current = null; };
	}, [conversationId, enabled]);

	const sendQuestion = (text: string) => {
		if (!enabled || isStreaming || !text.trim()) return;
		setError(null);
		setStreaming(true);
		setMessages(current => [...current, { role: "user", content: text }]);
		if (socket.current?.readyState === WebSocket.OPEN) socket.current.send(JSON.stringify({ type: "question", text }));
		else pendingQuestions.current.push(text);
	};
	return { sendQuestion, messages, isStreaming, error };
}
