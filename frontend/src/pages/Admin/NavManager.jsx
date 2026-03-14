import React, { useState, useEffect } from 'react';
import styles from './Admin.module.css';
import { 
    TextField, Button, Box, Typography, Paper, IconButton, 
    FormControl, InputLabel, Select, MenuItem, Grid, Switch, FormControlLabel,
    Dialog, DialogTitle, DialogContent, DialogActions, Divider
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import InfoRoundedIcon from '@mui/icons-material/InfoRounded';
import WorkHistoryRoundedIcon from '@mui/icons-material/WorkHistoryRounded';
import FolderSpecialRoundedIcon from '@mui/icons-material/FolderSpecialRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import ContactMailRoundedIcon from '@mui/icons-material/ContactMailRounded';
import ArticleRoundedIcon from '@mui/icons-material/ArticleRounded';
import BusinessRoundedIcon from '@mui/icons-material/BusinessRounded';
import HandshakeRoundedIcon from '@mui/icons-material/HandshakeRounded';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import TerminalRoundedIcon from '@mui/icons-material/TerminalRounded';
import LanguageRoundedIcon from '@mui/icons-material/LanguageRounded';
import StorageRoundedIcon from '@mui/icons-material/StorageRounded';
import BuildRoundedIcon from '@mui/icons-material/BuildRounded';
import AddCircleOutlineRoundedIcon from '@mui/icons-material/AddCircleOutlineRounded';

import { API_URL } from '../../config';
import { apiFetch } from '../../api';

const NAV_ICONS = [
    { value: 'home', label: 'Home', icon: <HomeRoundedIcon fontSize="small" /> },
    { value: 'about', label: 'About', icon: <InfoRoundedIcon fontSize="small" /> },
    { value: 'skill', label: 'Skill', icon: <WorkHistoryRoundedIcon fontSize="small" /> },
    { value: 'project', label: 'Project', icon: <FolderSpecialRoundedIcon fontSize="small" /> },
    { value: 'experience', label: 'Experience', icon: <WorkHistoryRoundedIcon fontSize="small" /> },
    { value: 'education', label: 'Education', icon: <SchoolRoundedIcon fontSize="small" /> },
    { value: 'course', label: 'Course', icon: <MenuBookRoundedIcon fontSize="small" /> },
    { value: 'achievement', label: 'Achievement', icon: <EmojiEventsRoundedIcon fontSize="small" /> },
    { value: 'paper', label: 'Paper', icon: <ArticleRoundedIcon fontSize="small" /> },
    { value: 'contact', label: 'Contact', icon: <ContactMailRoundedIcon fontSize="small" /> },
    { value: 'company', label: 'Company', icon: <BusinessRoundedIcon fontSize="small" /> },
    { value: 'handshake', label: 'Collaboration', icon: <HandshakeRoundedIcon fontSize="small" /> },
    { value: 'code', label: 'Code', icon: <CodeRoundedIcon fontSize="small" /> },
    { value: 'terminal', label: 'Terminal', icon: <TerminalRoundedIcon fontSize="small" /> },
    { value: 'web', label: 'Web', icon: <LanguageRoundedIcon fontSize="small" /> },
    { value: 'db', label: 'Database', icon: <StorageRoundedIcon fontSize="small" /> },
    { value: 'tools', label: 'Tools', icon: <BuildRoundedIcon fontSize="small" /> },
    { value: 'add', label: 'Add', icon: <AddCircleOutlineRoundedIcon fontSize="small" /> },
];

export default function NavManager({ setSnack, loadCustomSections }) {
    const [items, setItems] = useState([]);
    const [newItem, setNewItem] = useState({ label: '', href: '#', icon: 'home', order: 0, visible: true });
    const [editingItem, setEditingItem] = useState(null);

    // Custom Section state
    const [newSection, setNewSection] = useState({ label: '', icon: 'code', fields: [{ name: 'title', label: 'Title', type: 'text' }] });
    const [sections, setSections] = useState([]);

    const loadItems = async () => {
        try {
            const res = await apiFetch('/api/nav');
            const data = await res.json();
            setItems(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Failed to load nav:', err);
        }
    };

    const loadSections = async () => {
        try {
            const res = await apiFetch('/api/custom-sections');
            const data = await res.json();
            setSections(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Failed to load sections:', err);
        }
    };

    useEffect(() => { 
        loadItems(); 
        loadSections();
        const es = new EventSource(`${API_URL}/api/events`, { withCredentials: true });
        es.addEventListener('nav-update', (e) => {
            const data = JSON.parse(e.data);
            setItems(Array.isArray(data) ? data : []);
        });
        es.addEventListener('custom-sections-update', () => {
            loadSections();
            if (loadCustomSections) loadCustomSections();
        });
        return () => es.close();
    }, []);

    async function addItem(e) {
        if (e) e.preventDefault();
        try {
            const res = await apiFetch('/api/nav', {
                method: 'POST',
                body: JSON.stringify(newItem),
            });
            if (res.ok) {
                setNewItem({ label: '', href: '#', icon: 'home', order: 0, visible: true });
                loadItems();
                setSnack({ open: true, message: 'Navigation item added!', severity: 'success' });
            } else {
                setSnack({ open: true, message: 'Failed to add nav item', severity: 'error' });
            }
        } catch (err) {
            setSnack({ open: true, message: 'Server error', severity: 'error' });
        }
    }

    async function addSection(e) {
        if (e) e.preventDefault();
        const name = newSection.label.toLowerCase().replace(/\s+/g, '-');
        try {
            const res = await apiFetch('/api/custom-sections', {
                method: 'POST',
                body: JSON.stringify({ ...newSection, name }),
            });
            if (res.ok) {
                setNewSection({ label: '', icon: 'code', fields: [{ name: 'title', label: 'Title', type: 'text' }] });
                loadSections();
                if (loadCustomSections) loadCustomSections();
                setSnack({ open: true, message: 'Custom section created!', severity: 'success' });
            }
        } catch (err) {
            setSnack({ open: true, message: 'Server error', severity: 'error' });
        }
    }

    async function deleteSection(id) {
        try {
            const res = await apiFetch(`/api/custom-sections/${id}`, {
                method: 'DELETE',
            });
            if (res.ok) {
                loadSections();
                if (loadCustomSections) loadCustomSections();
                setSnack({ open: true, message: 'Section deleted!', severity: 'success' });
            }
        } catch (err) {
            setSnack({ open: true, message: 'Server error', severity: 'error' });
        }
    }

    async function saveEdit() {
        if (!editingItem) return;
        try {
            const res = await apiFetch(`/api/nav/${editingItem._id}`, {
                method: 'PUT',
                body: JSON.stringify(editingItem),
            });
            if (res.ok) {
                setEditingItem(null);
                loadItems();
                setSnack({ open: true, message: 'Navigation item updated!', severity: 'success' });
            }
        } catch (err) {
            setSnack({ open: true, message: 'Server error', severity: 'error' });
        }
    }

    async function deleteItem(id) {
        try {
            const res = await apiFetch(`/api/nav/${id}`, {
                method: 'DELETE',
            });
            if (res.ok) {
                loadItems();
                setSnack({ open: true, message: 'Navigation item deleted!', severity: 'success' });
            } else {
                setSnack({ open: true, message: 'Failed to delete nav item', severity: 'error' });
            }
        } catch (err) {
            setSnack({ open: true, message: 'Server error', severity: 'error' });
        }
    }

    async function moveItem(id, direction) {
        const idx = items.findIndex(i => i._id === id);
        if (idx === -1) return;
        const targetIdx = idx + direction;
        if (targetIdx < 0 || targetIdx >= items.length) return;

        const next = [...items];
        [next[idx], next[targetIdx]] = [next[targetIdx], next[idx]];
        setItems(next);
        
        try {
            await apiFetch('/api/nav/reorder', {
                method: 'PUT',
                body: JSON.stringify({ ids: next.map(i => i._id) }),
            });
        } catch (err) {
            setSnack({ open: true, message: 'Reorder failed', severity: 'error' });
        }
    }

    const getIcon = (iconName) => {
        const option = NAV_ICONS.find(o => o.value === iconName);
        return option ? option.icon : <HomeRoundedIcon fontSize="small" />;
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom color="primary">Manage Navigation Links</Typography>
            <Paper variant="outlined" sx={{ p: 3, mb: 4, backgroundColor: 'transparent', border: '1px solid #444' }}>
                <Typography variant="subtitle2" sx={{ mb: 2 }}>Add New Link</Typography>
                <form onSubmit={addItem} style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
                    <TextField label="Label" size="small" value={newItem.label} onChange={(e) => setNewItem({ ...newItem, label: e.target.value })} sx={{ flex: 1, minWidth: 150 }} />
                    <TextField label="Href" size="small" value={newItem.href} onChange={(e) => setNewItem({ ...newItem, href: e.target.value })} sx={{ flex: 1, minWidth: 150 }} />
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                        <InputLabel>Icon</InputLabel>
                        <Select
                            value={newItem.icon}
                            label="Icon"
                            onChange={(e) => setNewItem({ ...newItem, icon: e.target.value })}
                            renderValue={(value) => (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    {getIcon(value)} {NAV_ICONS.find(o => o.value === value)?.label}
                                </Box>
                            )}
                        >
                            {NAV_ICONS.map(icon => (
                                <MenuItem key={icon.value} value={icon.value}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        {icon.icon} {icon.label}
                                    </Box>
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <FormControlLabel
                        control={<Switch checked={newItem.visible} onChange={(e) => setNewItem({ ...newItem, visible: e.target.checked })} color="primary" />}
                        label="Visible"
                    />
                    <Button variant="contained" type="submit" startIcon={<AddIcon />}>Add Link</Button>
                </form>
            </Paper>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {items.map((i, idx) => (
                    <Paper key={i._id} sx={{ p: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#1e1e1e', border: '1px solid #333' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box sx={{ color: 'primary.main', display: 'flex' }}>{getIcon(i.icon)}</Box>
                            <Box>
                                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>{i.label}</Typography>
                                <Typography variant="caption" color="textSecondary">{i.href}</Typography>
                            </Box>
                            {!i.visible && <Typography variant="caption" sx={{ color: 'error.main', ml: 1 }}>(Hidden)</Typography>}
                        </Box>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                            <IconButton size="small" disabled={idx === 0} onClick={() => moveItem(i._id, -1)}><ArrowUpwardIcon fontSize="small" /></IconButton>
                            <IconButton size="small" disabled={idx === items.length - 1} onClick={() => moveItem(i._id, 1)}><ArrowDownwardIcon fontSize="small" /></IconButton>
                            <IconButton size="small" color="primary" onClick={() => setEditingItem(i)}><EditIcon fontSize="small" /></IconButton>
                            <IconButton size="small" color="error" onClick={() => deleteItem(i._id)}><DeleteIcon fontSize="small" /></IconButton>
                        </Box>
                    </Paper>
                ))}
            </Box>

            <Divider sx={{ my: 6 }} />

            <Typography variant="h6" gutterBottom color="primary">Manage Custom Sections (Dynamic Tabs)</Typography>
            <Paper variant="outlined" sx={{ p: 3, mb: 4, backgroundColor: 'transparent', border: '1px solid #444' }}>
                <Typography variant="subtitle2" sx={{ mb: 2 }}>Create New Custom Section</Typography>
                <form onSubmit={addSection}>
                    <Grid container spacing={2} alignItems="center">
                        <Grid size={{ xs: 12, md: 4 }}>
                            <TextField fullWidth label="Section Label (e.g. Testimonials)" size="small" value={newSection.label} onChange={(e) => setNewSection({ ...newSection, label: e.target.value })} />
                        </Grid>
                        <Grid size={{ xs: 12, md: 3 }}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Icon</InputLabel>
                                <Select
                                    value={newSection.icon}
                                    label="Icon"
                                    onChange={(e) => setNewSection({ ...newSection, icon: e.target.value })}
                                    renderValue={(value) => (
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            {getIcon(value)} {NAV_ICONS.find(o => o.value === value)?.label}
                                        </Box>
                                    )}
                                >
                                    {NAV_ICONS.map(icon => (
                                        <MenuItem key={icon.value} value={icon.value}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                {icon.icon} {icon.label}
                                            </Box>
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid size={12}>
                            <Typography variant="caption" sx={{ color: '#aaa', mb: 1, display: 'block' }}>Define Fields for this Section:</Typography>
                            {newSection.fields.map((field, fIdx) => (
                                <Box key={fIdx} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                                    <TextField label="Field Label" size="small" value={field.label} onChange={(e) => {
                                        const nextFields = [...newSection.fields];
                                        nextFields[fIdx].label = e.target.value;
                                        nextFields[fIdx].name = e.target.value.toLowerCase().replace(/\s+/g, '-');
                                        setNewSection({ ...newSection, fields: nextFields });
                                    }} />
                                    <FormControl size="small" sx={{ minWidth: 120 }}>
                                        <InputLabel>Type</InputLabel>
                                        <Select
                                            value={field.type}
                                            label="Type"
                                            onChange={(e) => {
                                                const nextFields = [...newSection.fields];
                                                nextFields[fIdx].type = e.target.value;
                                                setNewSection({ ...newSection, fields: nextFields });
                                            }}
                                        >
                                            <MenuItem value="text">Short Text</MenuItem>
                                            <MenuItem value="multiline">Long Text (Multiline)</MenuItem>
                                            <MenuItem value="link">Link/URL</MenuItem>
                                            <MenuItem value="number">Number</MenuItem>
                                            <MenuItem value="date">Date</MenuItem>
                                            <MenuItem value="image">Image URL</MenuItem>
                                        </Select>
                                    </FormControl>
                                    <IconButton size="small" color="error" onClick={() => {
                                        const nextFields = newSection.fields.filter((_, i) => i !== fIdx);
                                        setNewSection({ ...newSection, fields: nextFields });
                                    }}><DeleteIcon fontSize="small" /></IconButton>
                                </Box>
                            ))}
                            <Button size="small" startIcon={<AddIcon />} onClick={() => setNewSection({ ...newSection, fields: [...newSection.fields, { name: '', label: '', type: 'text' }] })}>Add Field</Button>
                        </Grid>
                        <Grid size={12}>
                            <Button variant="contained" type="submit" startIcon={<AddIcon />}>Create Custom Section</Button>
                        </Grid>
                    </Grid>
                </form>
            </Paper>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {sections.map((s) => (
                    <Paper key={s._id} sx={{ p: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#1e1e1e', border: '1px solid #333' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box sx={{ color: 'primary.main', display: 'flex' }}>{getIcon(s.icon)}</Box>
                            <Box>
                                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>{s.label} (Custom)</Typography>
                                <Typography variant="caption" color="textSecondary">{s.fields.length} Fields defined</Typography>
                            </Box>
                        </Box>
                        <IconButton size="small" color="error" onClick={() => deleteSection(s._id)}><DeleteIcon fontSize="small" /></IconButton>
                    </Paper>
                ))}
            </Box>

            <Dialog open={!!editingItem} onClose={() => setEditingItem(null)} fullWidth maxWidth="sm">
                <DialogTitle>Edit Navigation Link</DialogTitle>
                <DialogContent sx={{ pt: 2 }}>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid size={12}>
                            <TextField fullWidth label="Label" value={editingItem?.label || ''} onChange={(e) => setEditingItem({ ...editingItem, label: e.target.value })} />
                        </Grid>
                        <Grid size={12}>
                            <TextField fullWidth label="Href" value={editingItem?.href || ''} onChange={(e) => setEditingItem({ ...editingItem, href: e.target.value })} />
                        </Grid>
                        <Grid size={12}>
                            <FormControl fullWidth>
                                <InputLabel>Icon</InputLabel>
                                <Select
                                    value={editingItem?.icon || 'home'}
                                    label="Icon"
                                    onChange={(e) => setEditingItem({ ...editingItem, icon: e.target.value })}
                                    renderValue={(value) => (
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            {getIcon(value)} {NAV_ICONS.find(o => o.value === value)?.label}
                                        </Box>
                                    )}
                                >
                                    {NAV_ICONS.map(icon => (
                                        <MenuItem key={icon.value} value={icon.value}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                {icon.icon} {icon.label}
                                            </Box>
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid size={12}>
                            <FormControlLabel
                                control={<Switch checked={editingItem?.visible || false} onChange={(e) => setEditingItem({ ...editingItem, visible: e.target.checked })} color="primary" />}
                                label="Visible"
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setEditingItem(null)} startIcon={<CancelIcon />}>Cancel</Button>
                    <Button onClick={saveEdit} variant="contained" startIcon={<SaveIcon />}>Save Changes</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
