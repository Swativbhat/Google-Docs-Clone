import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function CreateDocument() {
  const [title, setTitle] = useState('');
  const navigate = useNavigate();

  const handleCreate = async () => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/documents`,
        { title },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      navigate(`/docs/${response.data._id}`);
    } catch (error) {
      console.error('Creation error:', error.response?.data);
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-6">New Document</h1>
      <div className="mb-4">
        <input
          type="text"
          className="w-full p-2 border rounded"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Document title (optional)"
          maxLength={100}
        />
      </div>
      <button
        onClick={handleCreate}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
      >
        Create
      </button>
    </div>
  );
}