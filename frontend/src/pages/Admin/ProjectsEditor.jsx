import React, { useEffect, useState } from 'react';
import styles from './Admin.module.css';
import { TextField, Button, Grid, Typography, Paper, Box, IconButton, Divider, Card, CardContent, Chip } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import LinkIcon from '@mui/icons-material/Link';
import GitHubIcon from '@mui/icons-material/GitHub';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { API_URL } from '../../config';

export default function ProjectsEditor({ setSnack }) {
  const [items, setItems] = useState([]);
  const [editingIdx, setEditingIdx] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [newItem, setNewItem] = useState({ title: '', technologies: '', liveLink: '', githubLink: '', keyContributions: '', order: 0 });

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_URL}/api/projects`, { credentials: 'include' });
        if (res.status === 401) return;
        const data = await res.json();
        setItems(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to load projects:', err);
      }
    })();
  }, []);

  async function loadItems() {
    try {
      const res = await fetch(`${API_URL}/api/projects`, { credentials: 'include' });
      if (res.status === 401) return;
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load projects:', err);
    }
  }

  async function add(e) {
    e.preventDefault();
    const payload = {
      ...newItem,
      technologies: newItem.technologies.split(',').map(t => t.trim()).filter(Boolean),
      keyContributions: newItem.keyContributions.split('\n').map(c => c.trim()).filter(Boolean)
    };
    try {
      const res = await fetch(`${API_URL}/api/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include'
      });
      if (res.ok) {
        setNewItem({ title: '', technologies: '', liveLink: '', githubLink: '', keyContributions: '', order: 0 });
        await loadItems();
        setSnack({ open: true, message: 'Project added!', severity: 'success' });
      }
    } catch (err) {
      setSnack({ open: true, message: 'Server error', severity: 'error' });
    }
  }

  const saveEdit = async () => {
    const updated = {
      ...editForm,
      technologies: editForm.technologies.split(',').map(t => t.trim()).filter(Boolean),
      keyContributions: editForm.keyContributions.split('\n').map(c => c.trim()).filter(Boolean)
    };
    
    try {
      const res = await fetch(`${API_URL}/api/projects/${updated._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
        credentials: 'include'
      });
      if (res.ok) {
        setEditingIdx(null);
        setEditForm(null);
        await loadItems();
        setSnack({ open: true, message: 'Project updated!', severity: 'success' });
      }
    } catch (err) {
      setSnack({ open: true, message: 'Server error', severity: 'error' });
    }
  };

  async function remove(id) {
    try {
      const res = await fetch(`${API_URL}/api/projects/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (res.ok) {
        await loadItems();
        setSnack({ open: true, message: 'Project deleted!', severity: 'success' });
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
      await fetch(`${API_URL}/api/projects/reorder`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: next.map(i => i._id) }),
        credentials: 'include'
      });
    } catch (err) {
      setSnack({ open: true, message: 'Reorder failed', severity: 'error' });
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
                <Grid size={12}>
                    <Typography variant="h5" gutterBottom color="primary">Manage Projects</Typography>
                    
                    <Paper sx={{ p: 3, mb: 4, backgroundColor: '#1a1a1a' }}>
                        <Typography variant="h6" gutterBottom>Add New Project</Typography>
                        <form onSubmit={add}>
                            <Grid container spacing={2}>
                                <Grid size={{ xs: 12, md: 3 }}>
                                    <TextField fullWidth label="Project Title" size="small" value={newItem.title} onChange={(e) => setNewItem({ ...newItem, title: e.target.value })} margin="normal" />
                                </Grid>
                                <Grid size={{ xs: 12, md: 3 }}>
                                    <TextField fullWidth label="Technologies (comma separated)" size="small" value={newItem.technologies} onChange={(e) => setNewItem({ ...newItem, technologies: e.target.value })} margin="normal" />
                                </Grid>
                                <Grid size={{ xs: 12, md: 3 }}>
                                    <TextField fullWidth label="Live Link" size="small" value={newItem.liveLink} onChange={(e) => setNewItem({ ...newItem, liveLink: e.target.value })} margin="normal" />
                                </Grid>
                                <Grid size={{ xs: 12, md: 3 }}>
                                    <TextField fullWidth label="GitHub Link" size="small" value={newItem.githubLink} onChange={(e) => setNewItem({ ...newItem, githubLink: e.target.value })} margin="normal" />
                                </Grid>
                                <Grid size={12}>
                                    <TextField fullWidth label="Key Contributions (one per line)" multiline rows={12} size="small" value={newItem.keyContributions} onChange={(e) => setNewItem({ ...newItem, keyContributions: e.target.value })} margin="normal" />
                                </Grid>
                            </Grid>
                            <Button variant="contained" type="submit" sx={{ mt: 2 }}>Add Project</Button>
                        </form>
                    </Paper>
                </Grid>

                <Grid size={{ xs: 12, lg: 7 }}>
                    <Typography variant="h6" gutterBottom color="primary">Current Projects</Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {items.map((item, idx) => (
                            <Paper key={item._id} sx={{ p: 2, backgroundColor: '#1e1e1e', border: '1px solid #333' }}>
                                {editingIdx === idx ? (
                                    <Box>
                                        <Grid container spacing={2}>
                                            <Grid size={{ xs: 12, md: 6 }}>
                                                <TextField fullWidth label="Title" size="small" value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} margin="normal" />
                                            </Grid>
                                            <Grid size={{ xs: 12, md: 6 }}>
                                                <TextField fullWidth label="Technologies" size="small" value={editForm.technologies} onChange={(e) => setEditForm({ ...editForm, technologies: e.target.value })} margin="normal" />
                                            </Grid>
                                            <Grid size={{ xs: 12, md: 6 }}>
                                                <TextField fullWidth label="Live Link" size="small" value={editForm.liveLink} onChange={(e) => setEditForm({ ...editForm, liveLink: e.target.value })} margin="normal" />
                                            </Grid>
                                            <Grid size={{ xs: 12, md: 6 }}>
                                                <TextField fullWidth label="GitHub Link" size="small" value={editForm.githubLink} onChange={(e) => setEditForm({ ...editForm, githubLink: e.target.value })} margin="normal" />
                                            </Grid>
                                            <Grid size={12}>
                                                <TextField fullWidth label="Contributions" multiline rows={12} size="small" value={editForm.keyContributions} onChange={(e) => setEditForm({ ...editForm, keyContributions: e.target.value })} margin="normal" />
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
                                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: 'primary.main' }}>{item.title}</Typography>
                                            <Typography variant="body2" color="textSecondary">{item.technologies?.join(', ')}</Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                                            <IconButton size="small" disabled={idx === 0} onClick={() => move(item._id, -1)}><ArrowUpwardIcon fontSize="small" /></IconButton>
                                            <IconButton size="small" disabled={idx === items.length - 1} onClick={() => move(item._id, 1)}><ArrowDownwardIcon fontSize="small" /></IconButton>
                                            <IconButton size="small" onClick={() => { setEditingIdx(idx); setEditForm({ ...item, technologies: item.technologies.join(', '), keyContributions: item.keyContributions.join('\n') }); }}><EditIcon fontSize="small" /></IconButton>
                                            <IconButton size="small" color="error" onClick={() => remove(item._id)}><DeleteIcon fontSize="small" /></IconButton>
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
                            {items.map((item, idx) => (
                                <Card key={idx} sx={{ backgroundColor: '#1e1e1e', color: '#fff', border: '1px solid #333' }}>
                                    <CardContent>
                                        <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 'bold' }}>{item.title}</Typography>
                                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', my: 1 }}>
                                            {item.technologies?.map((tech, i) => (
                                                <Chip key={i} label={tech} size="small" sx={{ backgroundColor: '#333', color: '#00bcd4' }} />
                                            ))}
                                        </Box>
                                        <ul style={{ margin: 0, paddingLeft: 20, color: '#ccc' }}>
                                            {item.keyContributions?.map((point, i) => (
                                                <li key={i}><Typography variant="body2" sx={{ mb: 0.5 }}>{point}</Typography></li>
                                            ))}
                                        </ul>
                                        <Box sx={{ display: 'flex', gap: 2, mt: 2, alignItems: 'center' }}>
                                            {item.liveLink && (
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                    <IconButton size="small" href={item.liveLink} target="_blank" color="primary">
                                                        <LinkIcon fontSize="small" />
                                                    </IconButton>
                                                    <Typography variant="caption" sx={{ color: 'primary.main', cursor: 'pointer' }} onClick={() => window.open(item.liveLink, '_blank')}>Live Demo</Typography>
                                                </Box>
                                            )}
                                            {item.githubLink && (
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                    <IconButton size="small" href={item.githubLink} target="_blank" color="primary">
                                                        <GitHubIcon fontSize="small" />
                                                    </IconButton>
                                                    <Typography variant="caption" sx={{ color: 'primary.main', cursor: 'pointer' }} onClick={() => window.open(item.githubLink, '_blank')}>Source Code</Typography>
                                                </Box>
                                            )}
                                        </Box>
                                    </CardContent>
                                </Card>
                            ))}
                        </Box>
                    </Box>
                </Grid>
      </Grid>
    </Box>
  );
}
