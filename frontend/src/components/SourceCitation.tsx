import { useState } from "react";

export type CitationSource =
	| { type: "graph"; entity?: string | null }
	| { type: "chunk"; documentId?: string | null; document_id?: string | null; page?: number | null };

export function SourceCitation({ source }: { source: CitationSource }) {
	const [expanded, setExpanded] = useState(false);
	const label = source.type === "graph"
		? `Entity: ${source.entity ?? "Unknown entity"}`
		: `Document: ${source.documentId ?? source.document_id ?? "Unknown document"}, page ${source.page ?? "?"}`;
	return <span className="relative mr-2 mt-1 inline-flex">
		<button type="button" className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-medium text-slate-300 transition hover:border-mint/30 hover:bg-mint/10 hover:text-mint focus:outline-none focus:ring-2 focus:ring-coral/60" title={label} aria-label={label} aria-expanded={expanded} onClick={() => setExpanded(current => !current)}>
			{source.type === "graph" ? `Entity: ${source.entity ?? "Unknown"}` : `Document p.${source.page ?? "?"}`}
		</button>
		{expanded && <span role="tooltip" className="absolute left-0 top-full z-10 mt-2 min-w-48 rounded-lg border border-white/10 bg-ink-soft px-3 py-2 text-xs text-slate-300 shadow-xl">{label}</span>}
	</span>;
}
