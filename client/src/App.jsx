import { BrowserRouter, Route,Routes } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthProvider } from "./Contexts/AuthContext";
import { SocketProvider } from "./Contexts/SocketContext";
import AppRoutes from "./routes";
import { NotificationProvider } from "./Contexts/NotificationContext";
import CreateDocument from './Pages/CreateDocument';
import PrivateRoute from './components/PrivateRoute'; // Add this import

export default function App() {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <BrowserRouter>
        <AuthProvider>
          <NotificationProvider>
            <SocketProvider>
              <div className="min-h-screen bg-gray-50">
                <AppRoutes />
                <Routes>
                <Route 
                  path="/create" 
                  element={
                    <PrivateRoute>
                      <CreateDocument />
                    </PrivateRoute>
                  } 
                  />
                  </Routes>
              </div>
            </SocketProvider>
          </NotificationProvider>
        </AuthProvider>
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
}