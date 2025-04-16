import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../Contexts/AuthContext';

export default function GoogleSignIn() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSuccess = async (credentialResponse) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/auth/google`,
        { token: credentialResponse.credential }
      );
      
      login(response.data.token, response.data.user);
      navigate('/dashboard');
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleError = () => {
    console.log('Login Failed');
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
    <div className="bg-white p-10 rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back to CollabDocs</h1>
        <p className="text-gray-600">Sign in to continue to your account</p>
      </div>
      
      <div className="flex justify-center mb-6">
        <GoogleLogin
          onSuccess={handleSuccess}
          onError={handleError}
          useOneTap
          auto_select
          shape="pill"
          theme="filled_blue"
          size="large"
          text="continue_with"
          logo_alignment="center"
          width="300"
        />
      </div>
  
     
  
      
    </div>
  </div>
  );
}