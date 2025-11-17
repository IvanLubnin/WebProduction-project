import { Routes, Route, Navigate } from "react-router-dom";
import AuthPage from "./AuthPage.jsx";
import TasksPage from "./TasksPage.jsx";

export default function App() {
  return (
    <Routes>
		<Route path="/auth" element={<AuthPage />} />
		<Route path="/tasks" element={<TasksPage />} />
		{/* to /auth by deafault*/}
		<Route path="*" element={<Navigate to="/auth" replace />} />
    </Routes>
  );
}
