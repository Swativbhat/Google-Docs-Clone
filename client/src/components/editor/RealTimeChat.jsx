import { useState, useEffect, useRef } from 'react';
import { useSocket } from '../../contexts/SocketContext';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import { useParams } from 'react-router-dom';

export default function RealTimeChat() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const socket = useSocket();
  const { user } = useAuth();
  const { id: documentId } = useParams();
  const messagesEndRef = useRef(null);

  // Load existing messages
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/documents/${documentId}/messages`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        setMessages(response.data);
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    fetchMessages();
  }, [documentId]);

  // Socket.io for real-time messages
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (message) => {
      setMessages(prev => [...prev, message]);
    };

    socket.on('receive-message', handleNewMessage);

    return () => {
      socket.off('receive-message', handleNewMessage);
    };
  }, [socket]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    socket.emit('send-message', newMessage, documentId);
    setNewMessage('');
  };

  return (
    <div className="border-t pt-4 mt-4">
      <h3 className="font-bold mb-2">Chat</h3>
      <div className="h-48 overflow-y-auto mb-2 border rounded p-2 bg-gray-50">
        {messages.map((msg, index) => (
          <div key={index} className={`mb-2 ${msg.user._id === user._id ? 'text-right' : ''}`}>
            <div className="text-xs text-gray-500">
              {msg.user.name} - {new Date(msg.timestamp).toLocaleTimeString()}
            </div>
            <div className={`inline-block px-3 py-1 rounded-lg ${msg.user._id === user._id ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
              {msg.message}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="flex">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          className="flex-1 p-2 border rounded-l"
          placeholder="Type a message..."
        />
        <button
          onClick={handleSendMessage}
          className="bg-blue-500 text-white px-4 py-2 rounded-r hover:bg-blue-600"
        >
          Send
        </button>
      </div>
    </div>
  );
}