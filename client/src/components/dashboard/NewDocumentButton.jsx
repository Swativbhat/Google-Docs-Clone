import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../Contexts/AuthContext';
import { Dialog, DialogContent, TextField, DialogActions, Button } from '@mui/material';

export default function NewDocumentButton() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [error, setError] = useState('');

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setTitle('');
    setError('');
  };

  const createNewDocument = async () => {
    if (title.length > 100) {
      setError('Title must be less than 100 characters');
      return;
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/documents`,
        { title: title.trim() || 'Untitled Document' }, // Use custom title or default
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      navigate(`/documents/${response.data._id}`);
      handleClose();
    } catch (error) {
      console.error('Error creating document:', error);
      setError(error.response?.data?.message || 'Failed to create document');
    }
  };

  return (
    <>
      <button
        onClick={handleOpen}
        className="flex items-center justify-center p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 mr-2"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4v16m8-8H4"
          />
        </svg>
        New Document
      </button>

      <Dialog open={open} onClose={handleClose}>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Document Title (Optional)"
            type="text"
            fullWidth
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setError('');
            }}
            error={!!error}
            helperText={error || "Leave blank for 'Untitled Document'"}
            inputProps={{ maxLength: 100 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={createNewDocument} color="primary">
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}