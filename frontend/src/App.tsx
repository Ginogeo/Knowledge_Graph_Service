import { Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { ChatPage } from "./pages/ChatPage";
import { DocumentsPage } from "./pages/DocumentsPage";
import { ConversationHistoryPage } from "./pages/ConversationHistoryPage";
import { AppShell } from "./components/AppShell";

export function App() {
	return <AuthProvider><Routes><Route path="/login" element={<LoginPage />} /><Route path="/register" element={<RegisterPage />} /><Route element={<ProtectedRoute />}><Route element={<AppShell />}><Route path="/chat" element={<ChatPage />} /><Route path="/chat/:conversationId" element={<ChatPage />} /><Route path="/documents" element={<DocumentsPage />} /><Route path="/conversations" element={<ConversationHistoryPage />} /></Route></Route><Route path="*" element={<Navigate to="/chat" replace />} /></Routes></AuthProvider>;
}
