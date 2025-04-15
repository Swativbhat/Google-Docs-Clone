import { useCallback, useEffect, useRef, useState } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import { useParams } from "react-router-dom";
import { useSocket } from "../../Contexts/SocketContext";
import { useAuth } from "../../Contexts/AuthContext";
import axios from "axios";
import ShareModal from "./ShareModal"; // Import the ShareModal component

const TOOLBAR_OPTIONS = [
  [{ header: [1, 2, 3, 4, 5, 6, false] }],
  [{ font: [] }],
  [{ list: "ordered" }, { list: "bullet" }],
  ["bold", "italic", "underline"],
  [{ color: [] }, { background: [] }],
  [{ script: "sub" }, { script: "super" }],
  [{ align: [] }],
  ["image", "blockquote", "code-block"],
  ["clean"],
];

export default function Editor() {
  const { id: documentId } = useParams();
  const [quill, setQuill] = useState(null);
  const [docData, setDocData] = useState(null); // Renamed from 'document' to avoid conflict
  const [collaborators, setCollaborators] = useState([]);
  const socket = useSocket();
  const { user } = useAuth();
  const wrapperRef = useRef(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const openShareModal = useCallback(() => {
    setIsShareModalOpen(true);
  }, []);

  const closeShareModal = useCallback(() => {
    setIsShareModalOpen(false);
  }, []);

  // Load document
  useEffect(() => {
    const fetchDocument = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/documents/${documentId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setDocData(response.data);
        setCollaborators(response.data.collaborators);
      } catch (error) {
        console.error("Error fetching document:", error);
      }
    };

    fetchDocument();
  }, [documentId]);

  // Set up Quill editor
  useEffect(() => {
    if (!wrapperRef.current) return;

    const editor = document.createElement("div"); // Now using the global document object
    wrapperRef.current.innerHTML = "";
    wrapperRef.current.appendChild(editor);

    const q = new Quill(editor, {
      theme: "snow",
      modules: { toolbar: TOOLBAR_OPTIONS },
    });
    q.disable();
    q.setText("Loading...");
    setQuill(q);

    return () => {
      if (wrapperRef.current) {
        wrapperRef.current.innerHTML = "";
      }
    };
  }, []);

  // Load document content into Quill
  useEffect(() => {
    if (quill == null || docData == null) return;

    quill.setContents(docData.content);
    quill.enable();
  }, [quill, docData]);

  // Socket.io for real-time collaboration
  useEffect(() => {
    if (socket == null || quill == null) return;

    const handler = (delta, oldDelta, source) => {
      if (source !== "user") return;
      socket.emit("send-changes", delta, documentId);
      console.log("Sending changes to document ID:", documentId);
    };

    quill.on("text-change", handler);

    return () => {
      quill.off("text-change", handler);
    };
  }, [socket, quill, documentId]);

  useEffect(() => {
    if (socket == null || quill == null) return;

    const handler = (delta) => {
      quill.updateContents(delta);
    };

    socket.on("receive-changes", handler);

    return () => {
      socket.off("receive-changes", handler);
    };
  }, [socket, quill]);

  // Join document room
  useEffect(() => {
    if (socket == null || !documentId) return;

    socket.emit("join-document", documentId);
  }, [socket, documentId]);

  // Handle new collaborators
  useEffect(() => {
    if (socket == null) return;

    const handler = (newCollaborator) => {
      setCollaborators((prev) => [...prev, newCollaborator]);
    };

    socket.on("user-joined", handler);

    return () => {
      socket.off("user-joined", handler);
    };
  }, [socket]);

  return (
    <div className="flex h-screen">
      <div className="flex-1 overflow-auto">
        <div ref={wrapperRef} className="h-full"></div>
      </div>
      <div className="w-64 bg-gray-100 p-4 border-l">
        <h3 className="font-bold mb-4">Collaborators</h3>
        <ul className="mb-4">
          {collaborators.map((collab) => (
            <li key={collab._id} className="flex items-center mb-2">
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white mr-2">
                {collab?.name?.charAt(0) || ""}
              </div>

              <span>{collab.name}</span>
            </li>
          ))}
        </ul>
      </div>
      {/* Button to open the ShareModal */}
      <button
        onClick={openShareModal}
        className="absolute top-4 right-4 bg-blue-600 text-white rounded p-2 hover:bg-blue-700"
      >
        Share
      </button>

      {/* Share Modal */}
      <ShareModal isOpen={isShareModalOpen} onClose={closeShareModal} />
    </div>
  );
}
