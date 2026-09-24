import type { DocumentStatus } from "../api/documents";

export function DocumentStatusBadge({ status }: { status: DocumentStatus }) {
	const styles = { pending: "border-amber-300/20 bg-amber-300/10 text-amber-200", processing: "border-sky-300/20 bg-sky-300/10 text-sky-200", ready: "border-mint/20 bg-mint/10 text-mint", failed: "border-coral/20 bg-coral/10 text-coral" };
	return <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${styles[status]}`} role="status"><span className="h-1.5 w-1.5 rounded-full bg-current" />{status}</span>;
}
