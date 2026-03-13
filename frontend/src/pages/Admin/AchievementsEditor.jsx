import React, { useState, useEffect } from 'react';
import styles from './Admin.module.css';
import { TextField, Button, Grid, Typography, Paper, Box, IconButton, Divider } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import BusinessIcon from '@mui/icons-material/Business';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { API_URL } from '../../config';

export default function AchievementsEditor({ setSnack }) {
    const [items, setItems] = useState([]);
    const [editingIdx, setEditingIdx] = useState(null);
    const [editForm, setEditForm] = useState(null);
    const [newItem, setNewItem] = useState({ title: '', company: '', date: '', location: '', description: '' });

    useEffect(() => {
        loadItems();
    }, []);

    async function loadItems() {
        const res = await fetch(`${API_URL}/api/achievements`, { credentials: 'include' });
        const data = await res.json();
        setItems(Array.isArray(data) ? data : []);
    }

    async function saveAll(next) {
        try {
            const res = await fetch(`${API_URL}/api/achievements`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ data: next }),
                credentials: 'include'
            });
            if (res.ok) {
                setItems(next);
                setSnack({ open: true, message: 'Achievements saved successfully!', severity: 'success' });
            } else {
                setSnack({ open: true, message: 'Failed to save achievements', severity: 'error' });
            }
        } catch (err) {
            setSnack({ open: true, message: 'Server error', severity: 'error' });
        }
    }

    async function add(e) {
        e.preventDefault();
        const payload = {
            ...newItem,
            description: newItem.description.split('\n').map(d => d.trim()).filter(Boolean)
        };
        try {
            const res = await fetch(`${API_URL}/api/achievements`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
                credentials: 'include'
            });
            if (res.ok) {
                setNewItem({ title: '', company: '', date: '', location: '', description: '' });
                await loadItems();
                setSnack({ open: true, message: 'Achievement added!', severity: 'success' });
            }
        } catch (err) {
            setSnack({ open: true, message: 'Server error', severity: 'error' });
        }
    }

    const startEdit = (idx) => {
        setEditingIdx(idx);
        setEditForm({
            ...items[idx],
            description: items[idx].description.join('\n')
        });
    };

    const cancelEdit = () => {
        setEditingIdx(null);
        setEditForm(null);
    };

    const saveEdit = async () => {
        const updated = {
            ...editForm,
            description: editForm.description.split('\n').map(d => d.trim()).filter(Boolean)
        };
        try {
            const res = await fetch(`${API_URL}/api/achievements/${updated._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updated),
                credentials: 'include'
            });
            if (res.ok) {
                setEditingIdx(null);
                setEditForm(null);
                await loadItems();
                setSnack({ open: true, message: 'Achievement updated!', severity: 'success' });
            }
        } catch (err) {
            setSnack({ open: true, message: 'Server error', severity: 'error' });
        }
    };

    const remove = async (id) => {
        try {
            const res = await fetch(`${API_URL}/api/achievements/${id}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            if (res.ok) {
                await loadItems();
                setSnack({ open: true, message: 'Achievement deleted!', severity: 'success' });
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
            await fetch(`${API_URL}/api/achievements/reorder`, {
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
                            <Paper sx={{ p: 2, backgroundColor: '#1e1e1e', color: '#fff', border: '1px solid #333' }}>
                                <Typography variant="subtitle1" fontWeight="bold" sx={{ color: 'primary.main' }}>{it.title}</Typography>
                                <Typography variant="body2" sx={{ color: '#ccc' }}>{it.company}</Typography>
                                <Typography variant="caption" sx={{ color: '#888' }}>{it.date}</Typography>
                            </Paper>
                        </Grid>
                    ))}
                </Grid>
            </Grid>

            <Grid size={12}>
                <Divider sx={{ my: 4 }} />
                <Typography variant="h6" gutterBottom color="primary">Manage Achievements</Typography>
                
                <Paper variant="outlined" sx={{ p: 3, mb: 4, backgroundColor: 'transparent', border: '1px solid #444' }}>
                    <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>Add New Achievement</Typography>
                    <form onSubmit={add}>
                        <Grid container spacing={3}>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField fullWidth label="Title" value={newItem.title} onChange={(e) => setNewItem({ ...newItem, title: e.target.value })} />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField fullWidth label="Organization" value={newItem.company} onChange={(e) => setNewItem({ ...newItem, company: e.target.value })} />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField fullWidth label="Date" value={newItem.date} onChange={(e) => setNewItem({ ...newItem, date: e.target.value })} />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField fullWidth label="Location" value={newItem.location} onChange={(e) => setNewItem({ ...newItem, location: e.target.value })} />
                            </Grid>
                            <Grid size={12}>
                                <TextField fullWidth multiline rows={8} label="Description (one per line)" value={newItem.description} onChange={(e) => setNewItem({ ...newItem, description: e.target.value })} />
                            </Grid>
                            <Grid size={12}>
                                <Button variant="contained" type="submit" startIcon={<AddIcon />} sx={{ px: 4 }}>Add Achievement to Top</Button>
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
                                        <TextField fullWidth size="small" label="Organization" value={editForm.company} onChange={(e) => setEditForm({ ...editForm, company: e.target.value })} />
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
                                </Grid>
                            ) : (
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Box>
                                        <Typography variant="subtitle1" sx={{ color: 'primary.main', fontWeight: 'bold' }}>{it.title}</Typography>
                                        <Typography variant="body2" sx={{ color: '#888' }}>{it.company} | {it.date}</Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                                        <IconButton size="small" onClick={() => move(idx, -1)} disabled={idx === 0}><ArrowUpwardIcon /></IconButton>
                                        <IconButton size="small" onClick={() => move(idx, 1)} disabled={idx === items.length - 1}><ArrowDownwardIcon /></IconButton>
                                        <IconButton size="small" color="primary" onClick={() => startEdit(idx)}><EditIcon /></IconButton>
                                        <IconButton size="small" color="error" onClick={() => remove(it._id)}><DeleteIcon /></IconButton>
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
