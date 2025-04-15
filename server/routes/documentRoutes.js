const express = require('express');
const router = express.Router();
const passport = require('passport');
const Document = require('../models/Document');
const { sendShareEmail } = require('../services/emailService');
const User = require('../models/User'); // or wherever your User model is located
const ChatMessage = require('../models/ChatMessage'); // Adjust the path if needed


// Get all documents for the authenticated user
router.get('/', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const documents = await Document.find({
      $or: [
        { owner: req.user.id },
        { collaborators: req.user.id }
      ]
    }).sort({ updatedAt: -1 });

    res.json(documents);
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new document
router.post('/', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const { title = 'Untitled Document' } = req.body;
    
    const document = new Document({
      title,
      owner: req.user.id,
      content: { ops: [{ insert: '\n' }] }
    });

    await document.save();
    
    // Add document to user's documents
    await User.findByIdAndUpdate(req.user.id, {
      $push: { documents: document._id }
    });

    res.status(201).json(document);
  } catch (error) {
    console.error('Error creating document:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a specific document
router.get('/:id', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      $or: [
        { owner: req.user.id },
        { collaborators: req.user.id }
      ]
    });

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    res.json(document);
  } catch (error) {
    console.error('Error fetching document:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a document
router.put('/:id', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const { content } = req.body;

    const document = await Document.findOneAndUpdate(
      {
        _id: req.params.id,
        $or: [
          { owner: req.user.id },
          { collaborators: req.user.id }
        ]
      },
      { content },
      { new: true }
    );

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    res.json(document);
  } catch (error) {
    console.error('Error updating document:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Share a document via email
router.post('/:id/share', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const { emails, message } = req.body;
    const documentId = req.params.id;

    // Verify document exists and user has permission
    const document = await Document.findOne({
      _id: documentId,
      owner: req.user.id
    }).populate('owner', 'name email');

    if (!document) {
      return res.status(404).json({ message: 'Document not found or access denied' });
    }

    // Find or create users for each email
    const usersToAdd = [];
    for (const email of emails) {
      let user = await User.findOne({ email });
      
      if (!user) {
        // Create a placeholder user who can sign up later
        user = new User({
          email,
          name: email.split('@')[0],
          isPlaceholder: true
        });
        await user.save();
      }
      
      if (!document.collaborators.includes(user._id)) {
        document.collaborators.push(user._id);
        usersToAdd.push(user);
      }
    }

    await document.save();

    // Send emails to all recipients
    await sendShareEmail({
      emails,
      message,
      documentId,
      documentTitle: document.title,
      senderName: document.owner.name
    });

    res.json({ message: 'Document shared successfully', document });
  } catch (error) {
    console.error('Error sharing document:', error);
    res.status(500).json({ message: 'Failed to share document' });
  }
});

// Delete a document
router.delete('/:id', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const document = await Document.findOneAndDelete({
      _id: req.params.id,
      owner: req.user.id
    });

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get chat messages for a document
router.get('/:id/messages', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      $or: [
        { owner: req.user.id },
        { collaborators: req.user.id }
      ]
    });

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    const messages = await ChatMessage.find({ documentId: req.params.id })
      .sort({ createdAt: 1 })
      .populate('user', 'name avatar');

    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;