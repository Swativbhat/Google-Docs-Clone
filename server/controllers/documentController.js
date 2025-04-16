const Document = require("../models/Document");
const User = require("../models/User");
const {
  saveDocumentContent,
  getDocumentContent,
} = require("../services/documentService");

exports.shareDocument = async (req, res) => {
  try {
    const { documentId } = req.params;
    const { email } = req.body; // Changed from emails to email
    const ownerId = req.user.id;

    console.log(`Sharing doc ${documentId} with ${email}`);

    const document = await Document.findOne({
      _id: documentId,
      owner: ownerId,
    });

    if (!document) {
      return res.status(404).json({ error: "Document not found" });
    }

    const userToShare = await User.findOne({ email });
    if (!userToShare) {
      return res.status(404).json({ error: "User not found" });
    }

    if (!document.collaborators.includes(userToShare._id)) {
      document.collaborators.push(userToShare._id);
      await document.save();
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Share error:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.saveDocument = async (req, res) => {
  try {
    const { documentId } = req.params; // Now matches route parameter name
    const { content } = req.body;
    
    console.log('Attempting to save document:', documentId);
    console.log('Authenticated user:', req.user._id);

    if (!documentId) {
      return res.status(400).json({ error: 'Document ID is required' });
    }

    const document = await Document.findOne({
      _id: documentId,
      $or: [
        { owner: req.user._id },
        { collaborators: req.user._id }
      ]
    });

    if (!document) {
      console.log('Permission details:', {
        requestingUser: req.user._id,
        documentOwner: document?.owner,
        collaborators: document?.collaborators
      });
      return res.status(403).json({ 
        error: 'Not authorized to edit this document' 
      });
    }

    const updatedDoc = await Document.findByIdAndUpdate(
      documentId,
      { content, updatedAt: Date.now() },
      { new: true }
    );

    res.json(updatedDoc);
  } catch (error) {
    console.error("Save error:", error);
    res.status(500).json({ 
      error: "Failed to save document",
      details: error.message 
    });
  }
};

exports.getDocuments = async (req, res) => {
  try {
    const { documentId } = req.params;
    console.log("Route reached with document ID:", documentId); 


    const document = await Document.findById(documentId)
      .populate('owner', 'name email avatar') 
      .populate('collaborators', 'name email avatar'); 

    if (!document) {
      console.log("Document not found");
      return res.status(404).json({ error: 'Document not found' });
    }

    console.log("Document fetched:", document); 
    console.log("Collaborators---:", document.collaborators);

    const allUsers = [
      {
        _id: document.owner._id,
        name: document.owner.name,
        email: document.owner.email,
        avatar: document.owner.avatar
      },
      ...document.collaborators.map(c => ({
        _id: c._id,
        name: c.name,
        email: c.email,
        avatar: c.avatar
      }))
    ];

    console.log("All users (owner + collaborators):", allUsers);

    console.log("Sending response with content and collaborators");
    res.json({
      content: document.content,
      collaborators: allUsers
    });

  } catch (error) {
    console.error('Error fetching document:', error);
    console.log("failed...failed");
    res.status(500).json({ error: error.message });
  }
};

