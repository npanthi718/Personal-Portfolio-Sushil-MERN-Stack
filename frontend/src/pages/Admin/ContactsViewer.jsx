import React, { useEffect, useState } from 'react';
import { Paper, Typography, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, IconButton } from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import DeleteIcon from '@mui/icons-material/Delete';
import { API_URL } from '../../config';

export default function ContactsViewer({ setSnack }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_URL}/api/contact/list`, { 
          credentials: 'include'
        });
        const data = await res.json();
        setItems(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to load contacts:', err);
      }
    })();

    const es = new EventSource(`${API_URL}/api/events`);
    es.addEventListener('contact-new', (e) => {
      try { 
        const data = JSON.parse(e.data); 
        setItems((prev) => [data, ...prev]); 
      } catch (err) {}
    });
    return () => es.close();
  }, []);

  const remove = async (id) => {
    try {
      const res = await fetch(`${API_URL}/api/contact/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (res.ok) {
        setItems(prev => prev.filter(it => it._id !== id));
        setSnack({ open: true, message: 'Message deleted', severity: 'success' });
      }
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom color="primary">Inquiries & Messages</Typography>
      <TableContainer component={Paper} sx={{ backgroundColor: '#1e1e1e', border: '1px solid #333' }}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead sx={{ backgroundColor: '#252525' }}>
            <TableRow>
              <TableCell sx={{ color: 'primary.main', fontWeight: 'bold' }}>Name</TableCell>
              <TableCell sx={{ color: 'primary.main', fontWeight: 'bold' }}>Email</TableCell>
              <TableCell sx={{ color: 'primary.main', fontWeight: 'bold' }}>Message</TableCell>
              <TableCell sx={{ color: 'primary.main', fontWeight: 'bold' }}>Date</TableCell>
              <TableCell sx={{ color: 'primary.main', fontWeight: 'bold' }} align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((it) => (
              <TableRow key={it._id} sx={{ '&:last-child td, &:last-child th': { border: 0 }, '&:hover': { backgroundColor: '#222' } }}>
                <TableCell sx={{ color: '#fff' }}>{it.name}</TableCell>
                <TableCell sx={{ color: '#aaa' }}>{it.email}</TableCell>
                <TableCell sx={{ color: '#ccc' }}>{it.message}</TableCell>
                <TableCell sx={{ color: '#888' }}>{it.createdAt ? new Date(it.createdAt).toLocaleDateString() : 'N/A'}</TableCell>
                <TableCell align="right">
                  <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                    <Button 
                      startIcon={<EmailIcon />} 
                      size="small" 
                      variant="outlined" 
                      href={`mailto:${it.email}?subject=Reply to your Portfolio Inquiry`}
                    >
                      Reply
                    </Button>
                    <IconButton color="error" size="small" onClick={() => remove(it._id)}>
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
            {items.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4, color: '#666' }}>
                  No messages found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
