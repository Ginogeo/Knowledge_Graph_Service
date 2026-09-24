import { apiRequest, clearAuthState, responseError, setAccessToken } from "./client";

export type User = { id: string; email: string; role: "user" | "admin" };
export type AuthResponse = { accessToken: string; refreshToken: string; user: User };

const credentials = (email: string, password: string) => ({ method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
const parse = async (response: Response): Promise<AuthResponse> => {
	if (!response.ok) throw await responseError(response, "Request failed");
	const data = await response.json() as AuthResponse;
	if (!data.accessToken || !data.refreshToken || !data.user) throw new Error("The authentication response was invalid.");
	setAccessToken(data.accessToken);
	localStorage.setItem("refreshToken", data.refreshToken);
	return data;
};
export const register = (email: string, password: string) => apiRequest("/auth/register", credentials(email, password)).then(parse);
export const login = (email: string, password: string) => apiRequest("/auth/login", credentials(email, password)).then(parse);
export const restore = async () => {
	if (!localStorage.getItem("refreshToken")) return null;
	try {
		return await parse(await apiRequest("/auth/refresh", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ refreshToken: localStorage.getItem("refreshToken") }) }, false));
	} catch (error) {
		clearAuthState();
		throw error;
	}
};
export const logout = async () => {
	try {
		await apiRequest("/auth/logout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ refreshToken: localStorage.getItem("refreshToken") }) });
	} finally {
		clearAuthState();
	}
};
