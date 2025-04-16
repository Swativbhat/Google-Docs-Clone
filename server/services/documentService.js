const Document = require('../models/Document');

exports.saveDocumentContent = async (documentId, content) => {
  try {
    const updatedDoc = await Document.findByIdAndUpdate(
      documentId,
      { content, updatedAt: Date.now() },
      { new: true }
    );
    return updatedDoc;
  } catch (error) {
    console.error('Error saving document:', error);
    throw error;
  }
};

exports.getDocumentContent = async (documentId) => {
  try {
    const doc = await Document.findById(documentId);
    return doc?.content || { ops: [{ insert: '\n' }] }; // Default empty doc
  } catch (error) {
    console.error('Error fetching document:', error);
    throw error;
  }
};