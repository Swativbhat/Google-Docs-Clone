import { useCallback, useEffect, useRef, useState } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import { useParams } from "react-router-dom";
import { useSocket } from "../../Contexts/SocketContext";
import { useAuth } from "../../Contexts/AuthContext";
import axios from "axios";
import ShareModal from "./ShareModal";

const TOOLBAR_OPTIONS = [
  // Text Formatting
  ["bold", "italic", "underline", "strike"],
  [{ color: [] }, { background: [] }], // Text & highlight colors
  
  // Headers & Fonts
  [{ header: [1, 2, 3, 4, 5, 6, false] }],
  [{ font: [] }], // All fonts (remove [1,2,3,4] for dynamic fonts)
  
  // Lists & Indentation
  [{ list: "ordered" }, { list: "bullet" }],
  [{ indent: "-1" }, { indent: "+1" }], // Indentation controls
  
  // Alignment & Script
  [{ align: [] }],
  [{ script: "sub" }, { script: "super" }],
  
  // Blocks & Media
  ["blockquote", "code-block"],
  ["link", "image", "video"],
  
  // Special Features
  [{ direction: "rtl" }], // Right-to-left text
  ["clean"], // Clear formatting
];

export default function Editor() {
  const { id: documentId } = useParams();
  const [quill, setQuill] = useState(null);
  const [docData, setDocData] = useState(null);
  const [collaborators, setCollaborators] = useState([]);
  const socket = useSocket();
  const { user } = useAuth();
  const wrapperRef = useRef(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [saveStatus, setSaveStatus] = useState("Saved");

  const openShareModal = useCallback(() => {
    setIsShareModalOpen(true);
  }, []);

  const closeShareModal = useCallback(() => {
    setIsShareModalOpen(false);
  }, []);

  // Save document content
  const saveDocument = useCallback(async () => {
    if (!quill || !documentId) return;

    try {
      setSaveStatus("Saving...");
      const content = quill.getContents();

      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/documents/${documentId}/save`,
        { content },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
          withCredentials: true, // Important for cookies if using them
        }
      );

      setSaveStatus("Saved");
      return response.data;
    } catch (error) {
      console.error("Save error:", error.response?.data);
      setSaveStatus("Failed to save");
    }
  }, [quill, documentId]);

  
  // Load document
  useEffect(() => {
    // Inside your fetchDocument function (around line 80)
    const fetchDocument = async () => {
      
      try {
        const token = localStorage.getItem("token"); 
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/documents/${documentId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setDocData(response.data);
        const usersResponse = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/users`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const collaborators = response.data.collaborators
        .map((collabId) => 
          usersResponse.data.find((user) => user._id === collabId)
        )
          .filter(Boolean); // Remove undefined (if user not found)
        
        console.log('FULL DOCUMENT RESPONSE:', response.data); // Add this line
        console.log("Document data:", response.data); // Add this line
        console.log("Collaborators:", response.data.collaborators); // Add this line
       
        setCollaborators(collaborators);
      } catch (error) {
        console.error("Error fetching document:", error);
      }
    };

    fetchDocument();
  }, [documentId]);

  // Set up Quill editor
  useEffect(() => {
    if (!wrapperRef.current) return;

    const editor = document.createElement("div");
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

  // Auto-save functionality
  useEffect(() => {
    if (!quill) return;

    const autoSaveInterval = setInterval(() => {
      saveDocument();
    }, 5000); // Save every 5 seconds

    return () => clearInterval(autoSaveInterval);
  }, [quill, saveDocument]);

  // Save on window/tab close
  useEffect(() => {
    const handleBeforeUnload = () => {
      saveDocument();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [saveDocument]);

  // Socket.io for real-time collaboration
  useEffect(() => {
    if (socket == null || quill == null) return;

    const handleTextChange = (delta, oldDelta, source) => {
      if (source !== "user") return;
      socket.emit("send-changes", delta, documentId);
      setSaveStatus("Unsaved");
    };

    quill.on("text-change", handleTextChange);

    return () => {
      quill.off("text-change", handleTextChange);
    };
  }, [socket, quill, documentId]);

  useEffect(() => {
    if (socket == null || quill == null) return;

    const handleReceiveChanges = (delta) => {
      quill.updateContents(delta);
      setSaveStatus("Unsaved");
    };

    socket.on("receive-changes", handleReceiveChanges);

    return () => {
      socket.off("receive-changes", handleReceiveChanges);
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

    const handleUserJoined = (newCollaborator) => {
      setCollaborators((prev) => [...prev, newCollaborator]);
    };

    socket.on("user-joined", handleUserJoined);

    return () => {
      socket.off("user-joined", handleUserJoined);
    };
  }, [socket]);

  return (
    <>
      <div className="flex h-screen">
        <div className="flex-1 overflow-auto">
          <div className="p-2 text-sm text-gray-500">Status: {saveStatus}</div>
          <div ref={wrapperRef} className="h-full"></div>
        </div>
        <div className="w-64 bg-gray-100 p-4 border-l">
          <h3 className="font-bold mb-4">Collaborators</h3>
          <ul className="mb-4">
  {collaborators.map((collab) => {
    // Generate a stable key using the collaborator's _id
    const uniqueKey = collab._id || Math.random().toString(36).substring(2, 9);
    
    return (
      <li key={uniqueKey} className="flex items-center mb-2">
        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white mr-2">
          {collab?.name?.charAt(0)?.toUpperCase() || "?"}
        </div>
        <div className="flex flex-col">
          <span className="font-medium">{collab.name || "Anonymous"}</span>
          <span className="text-xs text-gray-500">
            {collab.email || "No email available"}
          </span>
        </div>
      </li>
    );
  })}
</ul>
        </div>

        <button
          onClick={openShareModal}
          className="absolute top-4.5 right-60 bg-blue-600 text-white rounded p-1 hover:bg-blue-700"
        >
          Share
        </button>
      </div>

      <ShareModal
        open={isShareModalOpen}
        onClose={closeShareModal}
        documentId={documentId}
      />
    </>
  );
}
