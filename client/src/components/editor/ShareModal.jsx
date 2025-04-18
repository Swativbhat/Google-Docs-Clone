import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, TextField, DialogActions, Button } from '@mui/material';
import { shareDocument } from '../../Services/documents';

export default function ShareModal({ open, onClose, documentId }) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleShare = async () => {
    if (!email) {
      setError('Email is required');
      return;
    }

    try {
      await shareDocument(documentId, email);
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to share document');
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Share Document</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Collaborator Email"
          type="email"
          fullWidth
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setError('');
          }}
          error={!!error}
          helperText={error}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleShare} color="primary">
          Share
        </Button>
      </DialogActions>
    </Dialog>
  );
}