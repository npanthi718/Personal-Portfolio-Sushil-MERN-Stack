import React, { useState, useEffect } from 'react';
import { 
    TextField, Button, Grid, Typography, Paper, Box, IconButton, Divider, Card, CardContent 
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { API_URL } from '../../config';
import { apiFetch } from '../../api';

export default function DynamicEditor({ section, setSnack }) {
    const [items, setItems] = useState([]);
    const [editingIdx, setEditingIdx] = useState(null);
    const [editForm, setEditForm] = useState(null);
    const [newItem, setNewItem] = useState({});

    const loadItems = async () => {
        try {
            const res = await apiFetch(`/api/custom-items/${section._id}`);
            const data = await res.json();
            setItems(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Failed to load items:', err);
        }
    };

    useEffect(() => {
        loadItems();
        const es = new EventSource(`${API_URL}/api/events`, { withCredentials: true });
        es.addEventListener(`custom-items-update-${section._id}`, () => loadItems());
        return () => es.close();
    }, [section._id]);

    const add = async (e) => {
        if (e) e.preventDefault();
        try {
            const res = await apiFetch('/api/custom-items', {
                method: 'POST',
                body: JSON.stringify({ sectionId: section._id, data: newItem }),
            });
            if (res.ok) {
                setNewItem({});
                loadItems();
                setSnack({ open: true, message: 'Item added!', severity: 'success' });
            }
        } catch (err) {
            setSnack({ open: true, message: 'Server error', severity: 'error' });
        }
    };

    const saveEdit = async () => {
        try {
            const res = await apiFetch(`/api/custom-items/${editForm._id}`, {
                method: 'PUT',
                body: JSON.stringify(editForm),
            });
            if (res.ok) {
                setEditingIdx(null);
                setEditForm(null);
                loadItems();
                setSnack({ open: true, message: 'Item updated!', severity: 'success' });
            }
        } catch (err) {
            setSnack({ open: true, message: 'Server error', severity: 'error' });
        }
    };

    const remove = async (id) => {
        try {
            const res = await apiFetch(`/api/custom-items/${id}`, {
                method: 'DELETE',
            });
            if (res.ok) {
                loadItems();
                setSnack({ open: true, message: 'Item deleted!', severity: 'success' });
            }
        } catch (err) {
            setSnack({ open: true, message: 'Server error', severity: 'error' });
        }
    };

    const move = async (id, direction) => {
        const idx = items.findIndex(i => i._id === id);
        if (idx === -1) return;
        const targetIdx = idx + direction;
        if (targetIdx < 0 || targetIdx >= items.length) return;

        const next = [...items];
        [next[idx], next[targetIdx]] = [next[targetIdx], next[idx]];
        setItems(next);

        try {
            await apiFetch(`/api/custom-items/reorder/${section._id}`, {
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
                <Grid size={12}>
                    <Typography variant="h5" gutterBottom color="primary">Manage {section.label}</Typography>
                    <Paper variant="outlined" sx={{ p: 3, mb: 4, backgroundColor: 'transparent', border: '1px solid #444' }}>
                        <Typography variant="subtitle2" sx={{ mb: 2 }}>Add New Item</Typography>
                        <form onSubmit={add}>
                            <Grid container spacing={2}>
                                {section.fields.map(field => (
                                    <Grid size={{ xs: 12, md: field.type === 'multiline' ? 12 : 6 }} key={field.name}>
                                        <TextField 
                                            fullWidth 
                                            label={field.label} 
                                            size="small" 
                                            multiline={field.type === 'multiline'}
                                            rows={field.type === 'multiline' ? 4 : 1}
                                            value={newItem[field.name] || ''} 
                                            onChange={(e) => setNewItem({ ...newItem, [field.name]: e.target.value })} 
                                            margin="normal" 
                                        />
                                    </Grid>
                                ))}
                            </Grid>
                            <Button variant="contained" type="submit" sx={{ mt: 2 }} startIcon={<AddIcon />}>Add to Section</Button>
                        </form>
                    </Paper>
                </Grid>

                <Grid size={{ xs: 12, lg: 7 }}>
                    <Typography variant="h6" gutterBottom color="primary">Manage {section.label} Items</Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {items.map((item, idx) => (
                            <Paper key={item._id} sx={{ p: 2, backgroundColor: '#1e1e1e', border: '1px solid #333' }}>
                                {editingIdx === idx ? (
                                    <Box>
                                        <Grid container spacing={2}>
                                            {section.fields.map(field => (
                                                <Grid size={{ xs: 12, md: field.type === 'multiline' ? 12 : 6 }} key={field.name}>
                                                    <TextField 
                                                        fullWidth 
                                                        label={field.label} 
                                                        size="small" 
                                                        multiline={field.type === 'multiline'}
                                                        rows={field.type === 'multiline' ? 4 : 1}
                                                        value={editForm.data[field.name] || ''} 
                                                        onChange={(e) => setEditForm({ ...editForm, data: { ...editForm.data, [field.name]: e.target.value } })} 
                                                        margin="normal" 
                                                    />
                                                </Grid>
                                            ))}
                                        </Grid>
                                        <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                                            <Button variant="contained" color="success" startIcon={<SaveIcon />} onClick={saveEdit}>Save</Button>
                                            <Button variant="outlined" startIcon={<CancelIcon />} onClick={() => { setEditingIdx(null); setEditForm(null); }}>Cancel</Button>
                                        </Box>
                                    </Box>
                                ) : (
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Box>
                                            {section.fields.slice(0, 2).map(f => (
                                                <Typography key={f.name} variant={f.name === section.fields[0].name ? "subtitle1" : "body2"} sx={{ fontWeight: f.name === section.fields[0].name ? 'bold' : 'normal', color: f.name === section.fields[0].name ? 'primary.main' : 'textSecondary' }}>
                                                    {item.data[f.name]}
                                                </Typography>
                                            ))}
                                        </Box>
                                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                                            <IconButton size="small" disabled={idx === 0} onClick={() => move(item._id, -1)}><ArrowUpwardIcon fontSize="small" /></IconButton>
                                            <IconButton size="small" disabled={idx === items.length - 1} onClick={() => move(item._id, 1)}><ArrowDownwardIcon fontSize="small" /></IconButton>
                                            <IconButton size="small" color="primary" onClick={() => { setEditingIdx(idx); setEditForm(item); }}><EditIcon fontSize="small" /></IconButton>
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
                                        {section.fields.map(f => (
                                            <Typography 
                                                key={f.name} 
                                                variant={f.name === section.fields[0].name ? "h6" : "body2"} 
                                                sx={{ 
                                                    color: f.name === section.fields[0].name ? 'primary.main' : '#ccc', 
                                                    fontWeight: f.name === section.fields[0].name ? 'bold' : 'normal',
                                                    mb: 1,
                                                    whiteSpace: f.type === 'multiline' ? 'pre-wrap' : 'normal'
                                                }}
                                            >
                                                {item.data[f.name]}
                                            </Typography>
                                        ))}
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
