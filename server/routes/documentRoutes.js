const express = require('express');
const router = express.Router();
const passport = require('passport');
const Document = require('../models/Document');
const User = require('../models/User'); // or wherever your User model is located
const authMiddleware = require('../middlewares/auth'); // Add this import
const { saveDocument,shareDocument, getDocuments } = require('../controllers/documentController');


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
// Add this to your existing routes
router.post('/', 
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      const title = req.body.title?.trim() || 'Untitled Document';
      if (title.length > 100) {
        return res.status(400).json({ error: 'Title too long' });
      }

      const document = new Document({
        title,
        owner: req.user._id,
        content: { ops: [{ insert: '\n' }] }
      });

      await document.save();
      await User.findByIdAndUpdate(req.user._id, {
        $push: { documents: document._id }
      });

      res.status(201).json(document);
    } catch (error) {
      console.error('Document creation error:', error);
      res.status(500).json({ error: 'Failed to create document' });
    }
  }
);

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




router.post('/:documentId/share', authMiddleware, (req, res, next) => {
  console.log('Share route hit for document:', req.params.documentId);
  next();
}, shareDocument);

router.post('/:documentId/save', authMiddleware, saveDocument);
// router.get('/:documentId', authMiddleware, getDocuments);
router.get('/:documentId', async (req, res) => {
  console.log("Route reached for document ID:", req.params.documentId); // Ensure route is hit
  await getDocuments(req, res);
});



// router.get('/:id', authMiddleware, getDocuments);
router.post('/:id/save', authMiddleware, saveDocument);

module.exports = router;