import React, { useEffect, useState } from 'react';
import styles from './Admin.module.css';
import { TextField, Button, Grid, Typography, Paper, Box, IconButton, Divider } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import BusinessIcon from '@mui/icons-material/Business';
import EventIcon from '@mui/icons-material/Event';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { API_URL } from '../../config';
import { apiFetch } from '../../api';

export default function ExperienceEditor({ setSnack }) {
  const [items, setItems] = useState([]);
  const [editingIdx, setEditingIdx] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [newItem, setNewItem] = useState({ title: '', company: '', date: '', location: '', description: '', order: 0 });

  useEffect(() => {
    (async () => {
      try {
        const res = await apiFetch('/api/experience');
        if (res.status === 401) return;
        const data = await res.json();
        setItems(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to load experience:', err);
      }
    })();
  }, []);

  async function loadItems() {
    try {
      const res = await apiFetch('/api/experience');
      if (res.status === 401) return;
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load experience:', err);
    }
  }

  async function add(e) {
    e.preventDefault();
    const payload = {
      ...newItem,
      description: newItem.description.split('\n').map(d => d.trim()).filter(Boolean)
    };
    try {
      const res = await apiFetch('/api/experience', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setNewItem({ title: '', company: '', date: '', location: '', description: '', order: 0 });
        await loadItems();
        setSnack({ open: true, message: 'Experience added!', severity: 'success' });
      }
    } catch (err) {
      setSnack({ open: true, message: 'Server error', severity: 'error' });
    }
  }

  const saveEdit = async () => {
    const updated = {
      ...editForm,
      description: editForm.description.split('\n').map(d => d.trim()).filter(Boolean)
    };
    try {
      const res = await apiFetch(`/api/experience/${updated._id}`, {
        method: 'PUT',
        body: JSON.stringify(updated),
      });
      if (res.ok) {
        setEditingIdx(null);
        setEditForm(null);
        await loadItems();
        setSnack({ open: true, message: 'Experience updated!', severity: 'success' });
      }
    } catch (err) {
      setSnack({ open: true, message: 'Server error', severity: 'error' });
    }
  };

  async function remove(id) {
    try {
      const res = await apiFetch(`/api/experience/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        await loadItems();
        setSnack({ open: true, message: 'Experience deleted!', severity: 'success' });
      }
    } catch (err) {
      setSnack({ open: true, message: 'Server error', severity: 'error' });
    }
  }

  const move = async (id, direction) => {
    const idx = items.findIndex(i => i._id === id);
    if (idx === -1) return;
    const targetIdx = idx + direction;
    if (targetIdx < 0 || targetIdx >= items.length) return;

    const next = [...items];
    [next[idx], next[targetIdx]] = [next[targetIdx], next[idx]];
    setItems(next);

    try {
      await apiFetch('/api/experience/reorder', {
        method: 'PUT',
        body: JSON.stringify({ ids: next.map(i => i._id) }),
      });
    } catch (err) {
      setSnack({ open: true, message: 'Reorder failed', severity: 'error' });
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
                <Grid size={{ xs: 12, lg: 7 }}>
                    <Typography variant="h5" gutterBottom color="primary">Manage Experience</Typography>
                    
                    <Paper sx={{ p: 3, mb: 4, backgroundColor: '#1a1a1a' }}>
                        <Typography variant="h6" gutterBottom>Add New Experience</Typography>
                        <form onSubmit={add}>
                            <Grid container spacing={2}>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <TextField fullWidth label="Job Title" size="small" value={newItem.title} onChange={(e) => setNewItem({ ...newItem, title: e.target.value })} margin="normal" />
                                    <TextField fullWidth label="Company" size="small" value={newItem.company} onChange={(e) => setNewItem({ ...newItem, company: e.target.value })} margin="normal" />
                                </Grid>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <TextField fullWidth label="Date Range" size="small" value={newItem.date} onChange={(e) => setNewItem({ ...newItem, date: e.target.value })} margin="normal" />
                                    <TextField fullWidth label="Location" size="small" value={newItem.location} onChange={(e) => setNewItem({ ...newItem, location: e.target.value })} margin="normal" />
                                </Grid>
                                <Grid size={12}>
                                    <TextField fullWidth label="Description (one per line)" multiline rows={10} size="small" value={newItem.description} onChange={(e) => setNewItem({ ...newItem, description: e.target.value })} margin="normal" />
                                </Grid>
                            </Grid>
                            <Button variant="contained" type="submit" sx={{ mt: 2 }}>Add Experience</Button>
                        </form>
                    </Paper>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {items.map((exp, idx) => (
                            <Paper key={exp._id} sx={{ p: 2, backgroundColor: '#1e1e1e', border: '1px solid #333' }}>
                                {editingIdx === idx ? (
                                    <Box>
                                        <Grid container spacing={2}>
                                            <Grid size={{ xs: 12, md: 6 }}>
                                                <TextField fullWidth label="Title" size="small" value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} margin="normal" />
                                                <TextField fullWidth label="Company" size="small" value={editForm.company} onChange={(e) => setEditForm({ ...editForm, company: e.target.value })} margin="normal" />
                                            </Grid>
                                            <Grid size={{ xs: 12, md: 6 }}>
                                                <TextField fullWidth label="Date" size="small" value={editForm.date} onChange={(e) => setEditForm({ ...editForm, date: e.target.value })} margin="normal" />
                                                <TextField fullWidth label="Location" size="small" value={editForm.location} onChange={(e) => setEditForm({ ...editForm, location: e.target.value })} margin="normal" />
                                            </Grid>
                                            <Grid size={12}>
                                                <TextField fullWidth label="Description" multiline rows={10} size="small" value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} margin="normal" />
                                            </Grid>
                                        </Grid>
                                        <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                                            <Button variant="contained" color="success" startIcon={<SaveIcon />} onClick={saveEdit}>Save</Button>
                                            <Button variant="outlined" startIcon={<CancelIcon />} onClick={() => { setEditingIdx(null); setEditForm(null); }}>Cancel</Button>
                                        </Box>
                                    </Box>
                                ) : (
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Box>
                                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: 'primary.main' }}>{exp.title}</Typography>
                                            <Typography variant="body2" color="textSecondary">{exp.company} | {exp.date}</Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                                            <IconButton size="small" disabled={idx === 0} onClick={() => move(exp._id, -1)}><ArrowUpwardIcon fontSize="small" /></IconButton>
                                            <IconButton size="small" disabled={idx === items.length - 1} onClick={() => move(exp._id, 1)}><ArrowDownwardIcon fontSize="small" /></IconButton>
                                            <IconButton size="small" color="primary" onClick={() => { setEditingIdx(idx); setEditForm({ ...exp, description: exp.description.join('\n') }); }}><EditIcon fontSize="small" /></IconButton>
                                            <IconButton size="small" color="error" onClick={() => remove(exp._id)}><DeleteIcon fontSize="small" /></IconButton>
                                        </Box>
                                    </Box>
                                )}
                            </Paper>
                        ))}
                    </Box>
                </Grid>

                <Grid size={{ xs: 12, lg: 5 }}>
                    <Box sx={{ position: 'sticky', top: 20 }}>
                        <Typography variant="h6" gutterBottom color="primary">Live Preview</Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            {items.map((exp, idx) => (
                                <Paper key={idx} sx={{ p: 3, backgroundColor: '#1e1e1e', color: '#fff', border: '1px solid #333' }}>
                                    <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 'bold' }}>{exp.title}</Typography>
                                    <Box sx={{ display: 'flex', gap: 2, color: '#aaa', mb: 1, flexWrap: 'wrap' }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><BusinessIcon fontSize="small" /> {exp.company}</Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><EventIcon fontSize="small" /> {exp.date}</Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><LocationOnIcon fontSize="small" /> {exp.location}</Box>
                                    </Box>
                                    <ul style={{ margin: 0, paddingLeft: 20, color: '#ccc' }}>
                                        {exp.description?.map((point, i) => (
                                            <li key={i}><Typography variant="body2" sx={{ mb: 0.5 }}>{point}</Typography></li>
                                        ))}
                                    </ul>
                                </Paper>
                            ))}
                        </Box>
                    </Box>
                </Grid>
      </Grid>
    </Box>
  );
}
