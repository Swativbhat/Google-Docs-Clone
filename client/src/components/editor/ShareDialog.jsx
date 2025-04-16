import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, TextField, DialogActions, Button } from '@mui/material';
import { shareDocument } from '../../Services/documents';

export default function ShareDialog({ open, onClose, documentId }) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleShare = async () => {
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
          label="User Email"
          type="email"
          fullWidth
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={!!error}
          helperText={error}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleShare} disabled={!email}>Share</Button>
      </DialogActions>
    </Dialog>
  );
}