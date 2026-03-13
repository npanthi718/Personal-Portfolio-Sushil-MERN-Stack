import React, { useState, useEffect } from 'react';
import styles from './Admin.module.css';
import { TextField, Button, Grid, Typography, Paper, Box, IconButton, Divider } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import ArticleIcon from '@mui/icons-material/Article';
import BusinessIcon from '@mui/icons-material/Business';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { API_URL } from '../../config';

export default function PapersEditor({ setSnack }) {
    const [items, setItems] = useState([]);
    const [editingIdx, setEditingIdx] = useState(null);
    const [newItem, setNewItem] = useState({ title: '', organizer: '', institution: '', date: '', location: '', description: '', link: '', order: 0 });
    const [editForm, setEditForm] = useState({ title: '', organizer: '', institution: '', date: '', location: '', description: '', link: '', order: 0 });

    useEffect(() => {
        loadItems();
    }, []);

    async function loadItems() {
        const res = await fetch(`${API_URL}/api/papers`, { credentials: 'include' });
        const data = await res.json();
        setItems(Array.isArray(data) ? data : []);
    }

    const add = async (e) => {
        e.preventDefault();
        const payload = {
            ...newItem,
            description: newItem.description.split('\n').map(d => d.trim()).filter(Boolean)
        };
        try {
            const res = await fetch(`${API_URL}/api/papers`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
                credentials: 'include'
            });
            if (res.ok) {
                setNewItem({ title: '', organizer: '', institution: '', date: '', location: '', description: '', link: '', order: 0 });
                await loadItems();
                setSnack({ open: true, message: 'Paper added!', severity: 'success' });
            }
        } catch (err) {
            setSnack({ open: true, message: 'Server error', severity: 'error' });
        }
    };

    const startEdit = (idx) => {
        setEditingIdx(idx);
        setEditForm({
            ...items[idx],
            description: Array.isArray(items[idx].description) ? items[idx].description.join('\n') : ''
        });
    };

    const cancelEdit = () => {
        setEditingIdx(null);
        setEditForm({ title: '', organizer: '', institution: '', date: '', location: '', description: '', link: '', order: 0 });
    };

    const saveEdit = async () => {
        const updated = {
            ...editForm,
            description: editForm.description.split('\n').map(d => d.trim()).filter(Boolean)
        };
        try {
            const res = await fetch(`${API_URL}/api/papers/${updated._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updated),
                credentials: 'include'
            });
            if (res.ok) {
                setEditingIdx(null);
                setEditForm(null);
                await loadItems();
                setSnack({ open: true, message: 'Paper updated!', severity: 'success' });
            }
        } catch (err) {
            setSnack({ open: true, message: 'Server error', severity: 'error' });
        }
    };

    const remove = async (idx) => {
        try {
            const id = items[idx]._id;
            const res = await fetch(`${API_URL}/api/papers/${id}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            if (res.ok) {
                await loadItems();
                setSnack({ open: true, message: 'Paper deleted!', severity: 'success' });
            }
        } catch (err) {
            setSnack({ open: true, message: 'Server error', severity: 'error' });
        }
    };

    const move = async (idx, direction) => {
        const next = [...items];
        const targetIdx = idx + direction;
        if (targetIdx < 0 || targetIdx >= next.length) return;
        [next[idx], next[targetIdx]] = [next[targetIdx], next[idx]];
        setItems(next);

        try {
            await fetch(`${API_URL}/api/papers/reorder`, {
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
        <Grid container spacing={4}>
            <Grid size={12}>
                <Typography variant="h6" gutterBottom color="primary">Live Preview</Typography>
                <Grid container spacing={2}>
                    {items.map((it, idx) => (
                        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={idx}>
                            <Paper sx={{ p: 2, backgroundColor: '#1e1e1e', color: '#fff', border: '1px solid #333', height: '100%', display: 'flex', flexDirection: 'column' }}>
                                <Typography variant="subtitle1" fontWeight="bold" sx={{ color: 'primary.main' }}>{it.title}</Typography>
                                <Typography variant="body2" sx={{ color: '#ccc' }}>{it.organizer}</Typography>
                                <Typography variant="caption" sx={{ color: '#888', mb: 1 }}>{it.date}</Typography>
                                <Box sx={{ mt: 'auto', pt: 1 }}>
                                    {it.link ? (
                                        <Button 
                                            size="small" 
                                            variant="outlined" 
                                            startIcon={<ArticleIcon />} 
                                            href={it.link} 
                                            target="_blank"
                                            sx={{ textTransform: 'none', fontSize: '0.75rem' }}
                                        >
                                            View Published Paper
                                        </Button>
                                    ) : (
                                        <Typography variant="caption" sx={{ color: '#666', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                            <ArticleIcon sx={{ fontSize: '0.9rem' }} /> Paper is on press, not published yet.
                                        </Typography>
                                    )}
                                </Box>
                            </Paper>
                        </Grid>
                    ))}
                </Grid>
            </Grid>

            <Grid size={12}>
                <Divider sx={{ my: 4 }} />
                <Typography variant="h6" gutterBottom color="primary">Manage Research Papers</Typography>
                
                <Paper variant="outlined" sx={{ p: 3, mb: 4, backgroundColor: 'transparent', border: '1px solid #444' }}>
                    <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>Add New Paper</Typography>
                    <form onSubmit={add}>
                        <Grid container spacing={3}>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField fullWidth label="Title" value={newItem.title} onChange={(e) => setNewItem({ ...newItem, title: e.target.value })} />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField fullWidth label="Organizer" value={newItem.organizer} onChange={(e) => setNewItem({ ...newItem, organizer: e.target.value })} />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField fullWidth label="Institution" value={newItem.institution} onChange={(e) => setNewItem({ ...newItem, institution: e.target.value })} />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField fullWidth label="Date" value={newItem.date} onChange={(e) => setNewItem({ ...newItem, date: e.target.value })} />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField fullWidth label="Location" value={newItem.location} onChange={(e) => setNewItem({ ...newItem, location: e.target.value })} />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField fullWidth label="Link" value={newItem.link} onChange={(e) => setNewItem({ ...newItem, link: e.target.value })} />
                            </Grid>
                            <Grid size={12}>
                                <TextField fullWidth multiline rows={8} label="Description (one per line)" value={newItem.description} onChange={(e) => setNewItem({ ...newItem, description: e.target.value })} />
                            </Grid>
                            <Grid size={12}>
                                <Button variant="contained" type="submit" startIcon={<AddIcon />} sx={{ px: 4 }}>Add to Top</Button>
                            </Grid>
                        </Grid>
                    </form>
                </Paper>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {items.map((it, idx) => (
                        <Paper key={idx} sx={{ p: 3, backgroundColor: '#222', border: '1px solid #333' }}>
                            {editingIdx === idx ? (
                                <Grid container spacing={3}>
                                    <Grid size={12}>
                                        <TextField fullWidth size="small" label="Title" value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} />
                                    </Grid>
                                    <Grid size={12}>
                                        <TextField fullWidth size="small" label="Organizer" value={editForm.organizer} onChange={(e) => setEditForm({ ...editForm, organizer: e.target.value })} />
                                    </Grid>
                                    <Grid size={12}>
                                        <TextField fullWidth size="small" label="Institution" value={editForm.institution} onChange={(e) => setEditForm({ ...editForm, institution: e.target.value })} />
                                    </Grid>
                                    <Grid size={12}>
                                        <TextField fullWidth size="small" label="Date" value={editForm.date} onChange={(e) => setEditForm({ ...editForm, date: e.target.value })} />
                                    </Grid>
                                    <Grid size={12}>
                                        <TextField fullWidth size="small" label="Location" value={editForm.location} onChange={(e) => setEditForm({ ...editForm, location: e.target.value })} />
                                    </Grid>
                                    <Grid size={12}>
                                        <TextField fullWidth multiline rows={8} label="Description" value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} />
                                    </Grid>
                                    <Grid size={12} sx={{ display: 'flex', gap: 1 }}>
                                        <Button variant="contained" size="small" startIcon={<SaveIcon />} onClick={saveEdit}>Save</Button>
                                        <Button variant="outlined" size="small" startIcon={<CancelIcon />} onClick={cancelEdit}>Cancel</Button>
                                    </Grid>
                                    <Grid size={12}>
                                        <TextField fullWidth size="small" label="Link" value={editForm.link} onChange={(e) => setEditForm({ ...editForm, link: e.target.value })} />
                                    </Grid>
                                </Grid>
                            ) : (
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Box>
                                        <Typography variant="subtitle1" sx={{ color: 'primary.main', fontWeight: 'bold' }}>{it.title}</Typography>
                                        <Typography variant="body2" sx={{ color: '#888' }}>{it.organizer} | {it.date}</Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                                        <IconButton size="small" disabled={idx === 0} onClick={() => move(idx, -1)}><ArrowUpwardIcon fontSize="small" /></IconButton>
                                        <IconButton size="small" disabled={idx === items.length - 1} onClick={() => move(idx, 1)}><ArrowDownwardIcon fontSize="small" /></IconButton>
                                        <IconButton size="small" color="primary" onClick={() => startEdit(idx)}><EditIcon fontSize="small" /></IconButton>
                                        <IconButton size="small" color="error" onClick={() => remove(idx)}><DeleteIcon fontSize="small" /></IconButton>
                                    </Box>
                                </Box>
                            )}
                        </Paper>
                    ))}
                </Box>
            </Grid>
        </Grid>
    );
}
