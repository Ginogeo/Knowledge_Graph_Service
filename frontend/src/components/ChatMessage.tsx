export type MessageRole = "user" | "assistant";

export function ChatMessage({ role, content }: { role: MessageRole; content: string }) {
	return <article className={`message ${role}`} aria-label={role === "assistant" ? "Graph assistant message" : "Your message"}>
		<strong className="block text-xs font-semibold uppercase tracking-[0.14em] opacity-60">{role === "assistant" ? "Graph assistant" : "You"}</strong>
		<p className="mt-2 whitespace-pre-wrap text-sm leading-7">{content}</p>
	</article>;
}
