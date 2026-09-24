import { useRef, useState, type DragEvent, type FormEvent, type KeyboardEvent } from "react";
import { uploadDocument, type DocumentItem } from "../api/documents";
import { FileUp } from "lucide-react";

const allowedExtensions = new Set(["pdf", "doc", "docx", "txt", "html"]);

const validateFile = (candidate: File): string | null => {
	const extension = candidate.name.split(".").pop()?.toLowerCase();
	return extension && allowedExtensions.has(extension) ? null : "Choose a PDF, DOC, DOCX, TXT, or HTML file.";
};

export function DocumentUploadForm({ onUploaded }: { onUploaded: (document: DocumentItem) => void }) {
	const inputRef = useRef<HTMLInputElement>(null);
	const [file, setFile] = useState<File | null>(null);
	const [error, setError] = useState("");
	const [isUploading, setUploading] = useState(false);
	const selectFile = (candidate: File | undefined) => {
		setError("");
		if (!candidate) return;
		const validationError = validateFile(candidate);
		if (validationError) { setFile(null); setError(validationError); return; }
		setFile(candidate);
	};
	const submit = async (event: FormEvent) => {
		event.preventDefault();
		if (!file || isUploading) return;
		setUploading(true);
		try {
			const result = await uploadDocument(file);
			setFile(null);
			if (inputRef.current) inputRef.current.value = "";
			onUploaded({ ...result, filename: file.name });
		} catch (reason) {
			setError(reason instanceof Error ? reason.message : "Upload failed");
		} finally {
			setUploading(false);
		}
	};
	const handleDrop = (event: DragEvent<HTMLDivElement>) => {
		event.preventDefault();
		selectFile(event.dataTransfer.files[0]);
	};
	const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
		if (event.key === "Enter" || event.key === " ") { event.preventDefault(); inputRef.current?.click(); }
	};
	return <form className="space-y-3" onSubmit={submit}>
		<div className="group cursor-pointer rounded-xl border border-dashed border-white/15 bg-ink/30 px-5 py-8 text-center transition hover:border-coral/60 hover:bg-coral/[0.03] focus-within:border-coral/60" role="button" tabIndex={0} aria-label="Choose a document to upload" onKeyDown={handleKeyDown} onDragOver={event => event.preventDefault()} onDrop={handleDrop} onClick={() => inputRef.current?.click()}>
			<input ref={inputRef} type="file" accept=".pdf,.doc,.docx,.txt,.html" hidden onChange={event => selectFile(event.target.files?.[0])} />
			<FileUp className="mx-auto mb-3 text-coral transition group-hover:-translate-y-1" size={25} /><p className="text-sm font-medium text-slate-300">{file ? file.name : "Drop a source file here"}</p><p className="mt-1 text-xs text-slate-600">or click to browse · PDF, DOC, DOCX, TXT, HTML</p>
		</div>
		{error && <div role="alert" className="rounded-lg border border-coral/30 bg-coral/10 px-3 py-2 text-sm text-coral">{error}</div>}
		<button className="w-full rounded-xl bg-coral px-4 py-3 text-sm font-semibold text-ink transition hover:bg-[#ff9b72] disabled:cursor-not-allowed disabled:opacity-40" type="submit" disabled={!file || isUploading}>{isUploading ? "Uploading..." : "Upload document"}</button>
	</form>;
}
