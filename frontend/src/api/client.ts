const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
let accessToken: string | null = null;
let refreshPromise: Promise<boolean> | null = null;

export const setAccessToken = (token: string | null) => { accessToken = token; };
export const getAccessToken = () => accessToken;
export const clearAuthState = () => {
  accessToken = null;
  localStorage.removeItem("refreshToken");
};

const safeMessages: Record<string, string> = {
  EMAIL_TAKEN: "An account with that email already exists.",
  INVALID_CREDENTIALS: "Email or password is incorrect.",
  WEAK_PASSWORD: "Password must be at least 8 characters and contain a number.",
  VALIDATION_ERROR: "Please check the information you entered.",
  MISSING_TOKEN: "Your session has expired. Please sign in again.",
  INVALID_TOKEN: "Your session is no longer valid. Please sign in again.",
  TOKEN_EXPIRED: "Your session has expired. Please sign in again.",
  RATE_LIMIT_EXCEEDED: "Too many requests. Please try again shortly.",
  DOCUMENT_NOT_FOUND: "That document could not be found.",
  CONVERSATION_NOT_FOUND: "That conversation could not be found.",
  UPSTREAM_UNAVAILABLE: "The service is temporarily unavailable. Please try again shortly."
};

export const safeErrorMessage = (code: string | undefined, fallback: string): string => safeMessages[code ?? ""] ?? fallback;

export const responseError = async (response: Response, fallback: string): Promise<Error> => {
  try {
    const data = await response.json() as { error?: { code?: string }; detail?: { code?: string } };
    return new Error(safeErrorMessage(data.error?.code ?? data.detail?.code, fallback));
  } catch {
    return new Error(fallback);
  }
};

const refresh = async (): Promise<boolean> => {
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) return false;
  const response = await fetch(`${apiBaseUrl}/auth/refresh`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ refreshToken }) });
  if (!response.ok) return false;
  const data = await response.json() as { accessToken?: string; refreshToken?: string };
  if (!data.accessToken || !data.refreshToken) return false;
  setAccessToken(data.accessToken);
  localStorage.setItem("refreshToken", data.refreshToken);
  return true;
};

export const apiRequest = async (path: string, init: RequestInit = {}, retry = true): Promise<Response> => {
  const headers = new Headers(init.headers);
  if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);
  const response = await fetch(`${apiBaseUrl}${path}`, { ...init, headers });
  if (response.status !== 401 || !retry) return response;
  refreshPromise ??= refresh().finally(() => { refreshPromise = null; });
  if (!(await refreshPromise)) { clearAuthState(); window.location.assign("/login"); return response; }
  return apiRequest(path, init, false);
};
