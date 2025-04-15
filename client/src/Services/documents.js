import axios from 'axios';

export const createDocument = async (title = 'Untitled Document') => {
  const response = await axios.post(
    `${import.meta.env.VITE_API_BASE_URL}/api/documents`,
    { title },
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    }
  );
  return response.data;
};

export const getDocument = async (id) => {
  const response = await axios.get(
    `${import.meta.env.VITE_API_BASE_URL}/api/documents/${id}`,
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    }
  );
  return response.data;
};

export const getDocuments = async () => {
  const response = await axios.get(
    `${import.meta.env.VITE_API_BASE_URL}/api/documents`,
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    }
  );
  return response.data;
};

export const updateDocument = async (id, content) => {
  const response = await axios.put(
    `${import.meta.env.VITE_API_BASE_URL}/api/documents/${id}`,
    { content },
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    }
  );
  return response.data;
};

export const shareDocument = async (id, emails, message) => {
  const response = await axios.post(
    `${import.meta.env.VITE_API_BASE_URL}/api/documents/${id}/share`,
    { emails, message },
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    }
  );
  return response.data;
};

export const getDocumentMessages = async (id) => {
  const response = await axios.get(
    `${import.meta.env.VITE_API_BASE_URL}/api/documents/${id}/messages`,
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    }
  );
  return response.data;
};