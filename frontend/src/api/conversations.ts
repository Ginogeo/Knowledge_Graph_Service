import { apiRequest, responseError } from "./client";

export type Conversation = { _id: string; title?: string };
export type ConversationTurn = { question: string; answer: string; sources?: unknown[] };
export type ConversationDetail = Conversation & { turns?: ConversationTurn[] };

export const listConversations = async (): Promise<Conversation[]> => {
	const response = await apiRequest("/conversations");
	if (!response.ok) throw await responseError(response, "Conversations could not be loaded.");
	return await response.json() as Conversation[];
};
export const getConversation = async (id: string): Promise<ConversationDetail> => {
	const response = await apiRequest(`/conversations/${encodeURIComponent(id)}`);
	if (!response.ok) throw await responseError(response, "Conversation could not be loaded.");
	return await response.json() as ConversationDetail;
};
