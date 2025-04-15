import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../../Contexts/AuthContext';
import { TrashIcon, PencilIcon, ShareIcon } from '@heroicons/react/outline';

export default function DocumentList() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/documents`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }
        );
        setDocuments(response.data);
      } catch (err) {
        console.error('Error fetching documents:', err);
        setError('Failed to load documents');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchDocuments();
    }
  }, [user]);

  const handleDelete = async (documentId) => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_BASE_URL}/api/documents/${documentId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      setDocuments(documents.filter(doc => doc._id !== documentId));
    } catch (err) {
      console.error('Error deleting document:', err);
      setError('Failed to delete document');
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-12 bg-gray-200 rounded animate-pulse"></div>
        ))}
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 p-4">{error}</div>;
  }

  if (documents.length === 0) {
    return (
      <div className="text-center p-8 text-gray-500">
        No documents found. Create a new document to get started.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {documents.map((document) => (
        <div
          key={document._id}
          className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
        >
          <Link
            to={`/documents/${document._id}`}
            className="flex-1 truncate mr-4 hover:text-blue-600"
          >
            <h3 className="font-medium truncate">
              {document.title || 'Untitled Document'}
            </h3>
            <p className="text-xs text-gray-500 truncate">
              Last edited: {new Date(document.updatedAt).toLocaleString()}
            </p>
          </Link>

          <div className="flex space-x-2">
            <button
              onClick={() => navigator.clipboard.writeText(
                `${window.location.origin}/documents/${document._id}`
              )}
              className="p-1 text-gray-500 hover:text-blue-600"
              title="Share"
            >
              <ShareIcon className="h-5 w-5" />
            </button>
            <button
              onClick={() => handleDelete(document._id)}
              className="p-1 text-gray-500 hover:text-red-600"
              title="Delete"
            >
              <TrashIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}