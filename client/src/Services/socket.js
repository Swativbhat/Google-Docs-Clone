import io from 'socket.io-client';

let socket;

export const connectSocket = (token) => {
  socket = io(import.meta.env.VITE_API_BASE_URL, {
    query: { token },
  });
  return socket;
};

export const getSocket = () => {
  if (!socket) {
    throw new Error('Socket not connected');
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};