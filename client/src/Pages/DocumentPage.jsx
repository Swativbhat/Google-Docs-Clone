import { useEffect,useState } from 'react';
import { useParams, useNavigate, } from 'react-router-dom';
import { useAuth } from '../Contexts/AuthContext';
import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';
import Editor from '../components/editor/Editor';
import EditorToolbar from '../components/editor/EditorToolbar';

import ShareModal from '../components/editor/ShareModal';

export default function DocumentPage() {
  const { user, loading } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  if (loading || !user) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="flex flex-col h-screen">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="border-b p-2 bg-white">
            <EditorToolbar />
          </div>
          <div className="flex-1 overflow-auto">
            <Editor documentId={id} />
          </div>

        </div>
      </div>
      
      <ShareModal 
        isOpen={isShareModalOpen} 
        onClose={() => setIsShareModalOpen(false)} 
      />
    </div>
  );
}