import axios from 'axios';

export const googleLogin = async (token) => {
  const response = await axios.post(
    `${import.meta.env.VITE_API_BASE_URL}/api/auth/google`,
    { token }
  );
  return response.data;
};

export const getCurrentUser = async () => {
  const token = localStorage.getItem('token');
  if (!token) return null;

  try {
    const response = await axios.get(
      `${import.meta.env.VITE_API_BASE_URL}/api/auth/me`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching current user:', error);
    return null;
  }
};