import React, { useState, useEffect } from 'react';
import styles from './Admin.module.css';
import { TextField, Button, Grid, Typography, Paper, Box, IconButton, Divider } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import SchoolIcon from '@mui/icons-material/School';
import EventIcon from '@mui/icons-material/Event';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import HistoryIcon from '@mui/icons-material/History';
import GradeIcon from '@mui/icons-material/Grade';
import { API_URL } from '../../config';

export default function EducationEditor({ setSnack }) {
    const [items, setItems] = useState([]);
    const [editingIdx, setEditingIdx] = useState(null);
    const [editForm, setEditForm] = useState(null);
    const [newItem, setNewItem] = useState({ degree: '', institution: '', dates: '', cgpa: '', order: 0 });

    useEffect(() => {
        (async () => {
            const res = await fetch(`${API_URL}/api/education`, { credentials: 'include' });
            const data = await res.json();
            setItems(Array.isArray(data) ? data : []);
        })();
    }, []);

    async function loadItems() {
        const res = await fetch(`${API_URL}/api/education`, { credentials: 'include' });
        const data = await res.json();
        setItems(Array.isArray(data) ? data : []);
    }

    const add = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_URL}/api/education`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newItem),
                credentials: 'include'
            });
            if (res.ok) {
                setNewItem({ degree: '', institution: '', dates: '', cgpa: '', order: 0 });
                await loadItems();
                setSnack({ open: true, message: 'Education added!', severity: 'success' });
            }
        } catch (err) {
            setSnack({ open: true, message: 'Server error', severity: 'error' });
        }
    };

    const startEdit = (idx) => {
        setEditingIdx(idx);
        setEditForm({ ...items[idx] });
    };

    const cancelEdit = () => {
        setEditingIdx(null);
        setEditForm(null);
    };

    const saveEdit = async () => {
        try {
            const res = await fetch(`${API_URL}/api/education/${editForm._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editForm),
                credentials: 'include'
            });
            if (res.ok) {
                setEditingIdx(null);
                setEditForm(null);
                await loadItems();
                setSnack({ open: true, message: 'Education updated!', severity: 'success' });
            }
        } catch (err) {
            setSnack({ open: true, message: 'Server error', severity: 'error' });
        }
    };

    const remove = async (idx) => {
        try {
            const id = items[idx]._id;
            const res = await fetch(`${API_URL}/api/education/${id}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            if (res.ok) {
                await loadItems();
                setSnack({ open: true, message: 'Education deleted!', severity: 'success' });
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
            await fetch(`${API_URL}/api/education/reorder`, {
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
                            <Paper sx={{ p: 2, backgroundColor: '#1e1e1e', color: '#fff', border: '1px solid #333', height: '100%' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                    <SchoolIcon sx={{ color: 'primary.main' }} />
                                    <Typography variant="subtitle1" fontWeight="bold" sx={{ color: 'primary.main' }}>{it.degree}</Typography>
                                </Box>
                                <Typography variant="body2" sx={{ color: '#ccc', mb: 0.5 }}>{it.institution}</Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#888', mb: 0.5 }}>
                                    <HistoryIcon sx={{ fontSize: '0.9rem' }} />
                                    <Typography variant="caption">{it.dates}</Typography>
                                </Box>
                                {it.cgpa && (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#888' }}>
                                        <GradeIcon sx={{ fontSize: '0.9rem' }} />
                                        <Typography variant="caption">CGPA: {it.cgpa}</Typography>
                                    </Box>
                                )}
                            </Paper>
                        </Grid>
                    ))}
                </Grid>
            </Grid>

            <Grid size={12}>
                <Divider sx={{ my: 4 }} />
                <Typography variant="h6" gutterBottom color="primary">Manage Education</Typography>
                
                <Paper variant="outlined" sx={{ p: 3, mb: 4, backgroundColor: 'transparent', border: '1px solid #444' }}>
                    <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>Add New Education</Typography>
                    <form onSubmit={add}>
                        <Grid container spacing={3}>
                            <Grid size={12}>
                                <TextField fullWidth label="Degree/Program" value={newItem.degree} onChange={(e) => setNewItem({ ...newItem, degree: e.target.value })} />
                            </Grid>
                            <Grid size={12}>
                                <TextField fullWidth label="Institution" value={newItem.institution} onChange={(e) => setNewItem({ ...newItem, institution: e.target.value })} />
                            </Grid>
                            <Grid size={12}>
                                <TextField fullWidth label="Dates (e.g. 2020 - 2024)" value={newItem.dates} onChange={(e) => setNewItem({ ...newItem, dates: e.target.value })} />
                            </Grid>
                            <Grid size={12}>
                                <TextField fullWidth label="CGPA/Grade (Optional)" value={newItem.cgpa} onChange={(e) => setNewItem({ ...newItem, cgpa: e.target.value })} />
                            </Grid>
                            <Grid size={12}>
                                <Button variant="contained" type="submit" startIcon={<AddIcon />} sx={{ px: 4 }}>Add Education to Top</Button>
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
                                        <TextField fullWidth size="small" label="Degree" value={editForm.degree} onChange={(e) => setEditForm({ ...editForm, degree: e.target.value })} />
                                    </Grid>
                                    <Grid size={12}>
                                        <TextField fullWidth size="small" label="Institution" value={editForm.institution} onChange={(e) => setEditForm({ ...editForm, institution: e.target.value })} />
                                    </Grid>
                                    <Grid size={12}>
                                        <TextField fullWidth size="small" label="Dates" value={editForm.dates} onChange={(e) => setEditForm({ ...editForm, dates: e.target.value })} />
                                    </Grid>
                                    <Grid size={12}>
                                        <TextField fullWidth size="small" label="CGPA" value={editForm.cgpa} onChange={(e) => setEditForm({ ...editForm, cgpa: e.target.value })} />
                                    </Grid>
                                    <Grid size={12} sx={{ display: 'flex', gap: 1 }}>
                                        <Button variant="contained" size="small" startIcon={<SaveIcon />} onClick={saveEdit}>Save</Button>
                                        <Button variant="outlined" size="small" startIcon={<CancelIcon />} onClick={cancelEdit}>Cancel</Button>
                                    </Grid>
                                </Grid>
                            ) : (
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Box>
                                        <Typography variant="subtitle1" sx={{ color: 'primary.main', fontWeight: 'bold' }}>{it.degree}</Typography>
                                        <Typography variant="body2" sx={{ color: '#888' }}>{it.institution} | {it.dates}</Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                                        <IconButton size="small" onClick={() => move(idx, -1)} disabled={idx === 0}><ArrowUpwardIcon /></IconButton>
                                        <IconButton size="small" onClick={() => move(idx, 1)} disabled={idx === items.length - 1}><ArrowDownwardIcon /></IconButton>
                                        <IconButton size="small" color="primary" onClick={() => startEdit(idx)}><EditIcon /></IconButton>
                                        <IconButton size="small" color="error" onClick={() => remove(idx)}><DeleteIcon /></IconButton>
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
