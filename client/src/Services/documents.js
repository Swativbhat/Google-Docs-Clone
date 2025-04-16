import axios from "axios";

export const createDocument = async (title = "Untitled Document") => {
  const response = await axios.post(
    `${import.meta.env.VITE_API_BASE_URL}/api/documents`,
    { title },
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
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
        Authorization: `Bearer ${localStorage.getItem("token")}`,
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
        Authorization: `Bearer ${localStorage.getItem("token")}`,
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
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }
  );
  return response.data;
};



// export const shareDocument = async (documentId, email) => {
//   try {
//     const response = await axios.post(
//       `${import.meta.env.VITE_API_BASE_URL}/api/documents/${documentId}/share`,
//       { email },
//       {
//         headers: {
//           Authorization: `Bearer ${localStorage.getItem("token")}`,
//         },
//       }
//     );
//     return response.data;
//   } catch (error) {
//     // Handle any errors and throw an appropriate error message
//     throw new Error(error.response?.data?.error || 'Failed to share document');
//   }
// };
export const shareDocument = async (documentId, email) => {
  try {
    const response =await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/documents/${documentId}/share`, { 
      email 
    },  // Changed from emails to email
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Share error:', error.response);
    throw error;
  }
};


export const getDocumentMessages = async (id) => {
  const response = await axios.get(
    `${import.meta.env.VITE_API_BASE_URL}/api/documents/${id}/messages`,
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }
  );
  return response.data;
};

export const getNotifications = async () => {
  const response = await axios.get("/notifications");
  return response.data;
};
