import { apiRequest, responseError } from "./client";

export type DocumentStatus = "pending" | "processing" | "ready" | "failed";
export type DocumentItem = { documentId: string; filename?: string; status?: DocumentStatus; error?: string };

export const uploadDocument = async (file: File): Promise<Pick<DocumentItem, "documentId" | "status">> => {
	const body = new FormData();
	body.append("file", file);
	const response = await apiRequest("/documents", { method: "POST", body });
	if (!response.ok) throw await responseError(response, "Upload failed");
	return await response.json() as Pick<DocumentItem, "documentId" | "status">;
};
export const listDocuments = async (): Promise<DocumentItem[]> => {
	const response = await apiRequest("/documents");
	if (!response.ok) throw await responseError(response, "Documents could not be loaded.");
	return await response.json() as DocumentItem[];
};
export const documentStatus = async (id: string): Promise<Pick<DocumentItem, "status" | "error">> => {
	const response = await apiRequest(`/documents/${encodeURIComponent(id)}/status`);
	if (!response.ok) throw await responseError(response, "Document status could not be loaded.");
	return await response.json() as Pick<DocumentItem, "status" | "error">;
};
