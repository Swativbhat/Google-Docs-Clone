import { useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

export default function ShareModal({ isOpen, onClose }) {
  const [emails, setEmails] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { id: documentId } = useParams();

  const handleShare = async () => {
    if (!emails.trim()) return;
    
    setIsLoading(true);
    try {
      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/documents/${documentId}/share`, {
        emails: emails.split(',').map(email => email.trim()),
        message
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      alert('Document shared successfully!');
      onClose();
    } catch (error) {
      console.error('Error sharing document:', error);
      alert('Failed to share document');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Share Document</h2>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Email addresses (comma separated)</label>
          <input
            type="text"
            value={emails}
            onChange={(e) => setEmails(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="user1@example.com, user2@example.com"
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Message (optional)</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full p-2 border rounded"
            rows="3"
            placeholder="Check out this document..."
          />
        </div>
        
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={handleShare}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            disabled={isLoading}
          >
            {isLoading ? 'Sharing...' : 'Share'}
          </button>
        </div>
      </div>
    </div>
  );
}