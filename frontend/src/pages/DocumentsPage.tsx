import { useCallback, useEffect, useRef, useState } from "react";
import { DocumentUploadForm } from "../components/DocumentUploadForm";
import { DocumentStatusBadge } from "../components/DocumentStatusBadge";
import { documentStatus, listDocuments, type DocumentItem, type DocumentStatus } from "../api/documents";
import { FileCheck2, FileText, UploadCloud } from "lucide-react";

export function DocumentsPage() {
	const [documents, setDocuments] = useState<DocumentItem[]>([]);
	const documentsRef = useRef<DocumentItem[]>([]);
	const [error, setError] = useState<string | null>(null);
	const loading = useRef(false);
	const load = useCallback(async () => {
							try {
			setError(null);
			const listed = await listDocuments();
			const previous = new Map(documentsRef.current.map(document => [document.documentId, document]));
			const next = listed.map(document => ({ ...previous.get(document.documentId), ...document, filename: document.filename ?? previous.get(document.documentId)?.filename ?? document.documentId, status: document.status ?? previous.get(document.documentId)?.status ?? "pending" as DocumentStatus }));
			documentsRef.current = next;
			setDocuments(next);
		}
		catch (reason) { setError(reason instanceof Error ? reason.message : "Documents could not be loaded."); }
	}, []);
	useEffect(() => { void load(); }, [load]);
	useEffect(() => {
		const timer = window.setInterval(async () => {
			if (loading.current) return;
			loading.current = true;
			try {
				const current = documentsRef.current;
				const next = await Promise.all(current.map(async (document: DocumentItem) => document.status === "ready" || document.status === "failed" ? document : { ...document, ...(await documentStatus(document.documentId)) }));
				documentsRef.current = next;
				setDocuments(next);
			} catch (reason) { setError(reason instanceof Error ? reason.message : "Document status could not be loaded."); }
			finally { loading.current = false; }
		}, 3000);
		return () => window.clearInterval(timer);
	}, []);
	const handleUploaded = (document: DocumentItem) => {
		const next = [...documentsRef.current.filter(item => item.documentId !== document.documentId), { ...document, status: document.status ?? "pending" as DocumentStatus }];
		documentsRef.current = next;
		setDocuments(next);
		void load();
	};
	const readyCount = documents.filter(document => document.status === "ready").length;
	return <div className="min-h-[calc(100vh-1px)] px-5 py-6 sm:px-8 lg:px-12 lg:py-10"><div className="mx-auto max-w-5xl"><header className="mb-9 flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-coral">Knowledge library</p><h1 className="font-display text-4xl font-semibold tracking-tight text-white">Your source material.</h1><p className="mt-3 text-slate-400">Upload the documents Nexus should understand.</p></div><div className="flex gap-3"><div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3"><p className="text-xl font-semibold text-white">{documents.length}</p><p className="text-xs text-slate-500">Total files</p></div><div className="rounded-xl border border-mint/20 bg-mint/5 px-4 py-3"><p className="text-xl font-semibold text-mint">{readyCount}</p><p className="text-xs text-slate-500">Ready to query</p></div></div></header><section className="grid gap-6 lg:grid-cols-[.9fr_1.1fr]"><div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5"><div className="mb-5 flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-lg bg-coral/10 text-coral"><UploadCloud size={18} /></span><div><h2 className="font-display font-semibold text-white">Add a document</h2><p className="text-xs text-slate-500">PDF, Word, TXT, or HTML</p></div></div><DocumentUploadForm onUploaded={handleUploaded} /></div><div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5"><div className="mb-5 flex items-center justify-between"><div><h2 className="font-display font-semibold text-white">Ingestion status</h2><p className="mt-1 text-xs text-slate-500">Updates automatically every few seconds</p></div><FileCheck2 size={19} className="text-mint" /></div>{error && <div role="alert" className="mb-4 rounded-lg border border-coral/30 bg-coral/10 px-3 py-2 text-sm text-coral">{error}</div>}{documents.length === 0 ? <div className="rounded-xl border border-dashed border-white/10 px-5 py-12 text-center"><FileText className="mx-auto mb-3 text-slate-600" size={26} /><p className="text-sm text-slate-400">No documents yet.</p><p className="mt-1 text-xs text-slate-600">Your uploaded sources will appear here.</p></div> : <div className="space-y-2">{documents.map(document => <div className="flex items-center gap-3 rounded-xl border border-white/5 bg-ink/40 px-3 py-3" key={document.documentId}><span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white/5 text-slate-400"><FileText size={17} /></span><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium text-slate-200">{document.filename ?? document.documentId}</p>{document.error ? <p className="truncate text-xs text-coral">Document processing failed. Please try uploading it again.</p> : <p className="text-xs text-slate-600">Source document</p>}</div><DocumentStatusBadge status={document.status ?? "pending"} /></div>)}</div>}</div></section></div></div>;
}
