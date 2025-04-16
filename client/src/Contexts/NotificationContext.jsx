import React, { createContext, useContext, useState, useEffect } from 'react';
import { getNotifications } from '../Services/documents';
import { io } from "socket.io-client";


const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);

  const fetchNotifications = async () => {
    try {
      const data = await getNotifications();
      setNotifications(data);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  // Socket.io handler for real-time updates
  useEffect(() => {
    const socket = io(import.meta.env.VITE_API_URL);
    socket.on('new-notification', (notification) => {
      setNotifications(prev => [notification, ...prev]);
    });
    return () => socket.disconnect();
  }, []);

  return (
    <NotificationContext.Provider value={{ notifications, refresh: fetchNotifications }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  return useContext(NotificationContext);
}