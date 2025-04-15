const Document = require('../models/Document');
const User = require('../models/User');
const { sendShareEmail } = require('../services/emailService');

exports.shareDocument = async (req, res) => {
  try {
    const { emails, message } = req.body;
    const documentId = req.params.id;
    const userId = req.user.id;

    // Verify document exists and user has permission
    const document = await Document.findOne({
      _id: documentId,
      $or: [{ owner: userId }, { collaborators: userId }]
    });

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
      senderName: req.user.name
    });

    res.status(200).json({ message: 'Document shared successfully', document });
  } catch (error) {
    console.error('Error sharing document:', error);
    res.status(500).json({ message: 'Failed to share document' });
  }
};