import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext.jsx';
import io from 'socket.io-client';

const SocketContext = createContext();

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const newSocket = io(import.meta.env.VITE_API_BASE_URL, {
      query: { token: localStorage.getItem('token') },
    });

    newSocket.on('connect', () => {
      console.log('Socket connected');
      // Moved inside connect handler to ensure socket is ready
      newSocket.emit('join-user-room', user._id);
    });

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    // Add notification handler
    newSocket.on('notification', (notification) => {
      // You might want to handle incoming notifications here
      console.log('New notification:', notification);
    });

    setSocket(newSocket);

    return () => {
      newSocket.off('notification'); // Clean up event listener
      newSocket.disconnect();
    };
  }, [user]);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}