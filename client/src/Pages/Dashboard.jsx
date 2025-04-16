import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Contexts/AuthContext";
import Header from "../components/layout/Header";
import Sidebar from "../components/layout/Sidebar";
import { useNotifications } from "../Contexts/NotificationContext";
import NewDocumentButton from "../components/dashboard/NewDocumentButton";
import DocumentList from "../components/dashboard/DocumentList";



export default function Dashboard() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { notifications, refresh } = useNotifications();

  useEffect(() => {
    refresh();
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/");
    }
  }, [user, loading, navigate]);

  if (loading || !user) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-auto p-8 bg-gray-100">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-4">Welcome, {user.name}</h1>
              <p className="text-gray-600">
                Create a new document or select an existing one to get started.
              </p>
            </div>
            <NewDocumentButton />
          </div>
        </main>
      </div>
        <div className="main-content">
          <DocumentList />
        </div>
      </div>
  );
}
