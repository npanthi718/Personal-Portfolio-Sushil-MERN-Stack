import React, { useState, useEffect } from 'react';
import styles from './Admin.module.css';
import { TextField, Button, Grid, Typography, Paper, Box, IconButton, Divider, MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { FaEnvelope, FaPhone, FaLinkedin, FaGithub, FaLink, FaTwitter, FaInstagram, FaGlobe } from 'react-icons/fa';
import { API_URL } from '../../config';

const iconOptions = [
    { label: 'Email', value: 'email', icon: <FaEnvelope /> },
    { label: 'Phone', value: 'phone', icon: <FaPhone /> },
    { label: 'LinkedIn', value: 'linkedin', icon: <FaLinkedin /> },
    { label: 'GitHub', value: 'github', icon: <FaGithub /> },
    { label: 'Twitter', value: 'twitter', icon: <FaTwitter /> },
    { label: 'Instagram', value: 'instagram', icon: <FaInstagram /> },
    { label: 'Website', value: 'website', icon: <FaGlobe /> },
    { label: 'Other', value: 'link', icon: <FaLink /> },
];

export default function AboutEditor({ setSnack }) {
    const [about, setAbout] = useState({ paragraphs: [], contactList: [] });
    const [newParagraph, setNewParagraph] = useState('');
    const [newContact, setNewContact] = useState({ label: '', value: '', url: '', icon: 'email' });

    useEffect(() => {
        (async () => {
            try {
                const res = await fetch(`${API_URL}/api/about/single`, { credentials: 'include' });
                if (res.status === 401) {
                    console.warn('Unauthorized to load about data');
                    return;
                }
                const data = await res.json();
                if (data) {
                    setAbout(data);
                }
            } catch (err) {
                console.error('Failed to load about:', err);
            }
        })();
    }, []);

    async function save(next) {
        try {
            const { _id, createdAt, updatedAt, __v, ...dataToSave } = next;
            const res = await fetch(`${API_URL}/api/about/single`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dataToSave),
                credentials: 'include'
            });
            if (res.status === 401) {
                setSnack({ open: true, message: 'Unauthorized. Please login again.', severity: 'error' });
                return;
            }
            if (res.ok) {
                setAbout(next);
                setSnack({ open: true, message: 'About content saved!', severity: 'success' });
            } else {
                setSnack({ open: true, message: 'Failed to save about content', severity: 'error' });
            }
        } catch (err) {
            setSnack({ open: true, message: 'Server error', severity: 'error' });
        }
    }

    const addParagraph = () => {
        if (!newParagraph.trim()) return;
        const next = { ...about, paragraphs: [...(about.paragraphs || []), newParagraph.trim()] };
        setNewParagraph('');
        save(next);
    };

    const removeParagraph = (idx) => {
        const next = { ...about, paragraphs: about.paragraphs.filter((_, i) => i !== idx) };
        save(next);
    };

    const moveParagraph = (idx, direction) => {
        const next = [...about.paragraphs];
        const targetIdx = idx + direction;
        if (targetIdx < 0 || targetIdx >= next.length) return;
        [next[idx], next[targetIdx]] = [next[targetIdx], next[idx]];
        save({ ...about, paragraphs: next });
    };

    const addContact = () => {
        if (!newContact.label || !newContact.value) return;
        const next = { ...about, contactList: [newContact, ...(about.contactList || [])] };
        setNewContact({ label: '', value: '', url: '', icon: 'email' });
        save(next);
    };

    const removeContact = (idx) => {
        const next = { ...about, contactList: about.contactList.filter((_, i) => i !== idx) };
        save(next);
    };

    const moveContact = (idx, direction) => {
        const next = [...about.contactList];
        const targetIdx = idx + direction;
        if (targetIdx < 0 || targetIdx >= next.length) return;
        [next[idx], next[targetIdx]] = [next[targetIdx], next[idx]];
        save({ ...about, contactList: next });
    };

    const getIcon = (iconName) => {
        const option = iconOptions.find(o => o.value === iconName);
        return option ? option.icon : <FaLink />;
    };

    return (
        <Grid container spacing={4}>
            <Grid size={12}>
                <Typography variant="h6" gutterBottom color="primary">Live Preview</Typography>
                <Paper sx={{ p: 4, backgroundColor: '#1e1e1e', border: '1px solid #333' }}>
                    <Grid container spacing={4}>
                        <Grid size={{ xs: 12, md: 7 }}>
                            {about.paragraphs?.map((p, i) => (
                                <Typography key={i} sx={{ mb: 2, color: '#ccc', lineHeight: 1.7, fontSize: '1.05rem' }}>{p}</Typography>
                            ))}
                        </Grid>
                        <Grid size={{ xs: 12, md: 5 }}>
                            <Paper variant="outlined" sx={{ p: 3, backgroundColor: '#252525' }}>
                                <Typography variant="h6" sx={{ color: 'primary.main', mb: 2, fontWeight: 'bold' }}>Contact Details</Typography>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    {about.contactList?.map((c, i) => (
                                        <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <Box sx={{ color: 'primary.main', fontSize: '1.2rem', display: 'flex' }}>{getIcon(c.icon)}</Box>
                                            <Box>
                                                <Typography variant="caption" sx={{ color: '#888', display: 'block' }}>{c.label}</Typography>
                                                {c.url ? (
                                                    <Typography component="a" href={c.url} target="_blank" sx={{ color: '#fff', textDecoration: 'none', '&:hover': { color: 'primary.main' } }}>
                                                        {c.value}
                                                    </Typography>
                                                ) : (
                                                    <Typography sx={{ color: '#fff' }}>{c.value}</Typography>
                                                )}
                                            </Box>
                                        </Box>
                                    ))}
                                </Box>
                            </Paper>
                        </Grid>
                    </Grid>
                </Paper>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="h6" gutterBottom color="primary">Manage Paragraphs</Typography>
                <Box sx={{ mb: 4 }}>
                    {about.paragraphs?.map((p, i) => (
                        <Paper key={i} variant="outlined" sx={{ p: 2, mb: 2, backgroundColor: 'transparent' }}>
                            <TextField 
                                fullWidth 
                                multiline 
                                size="small" 
                                value={p} 
                                onChange={(e) => {
                                    const next = [...about.paragraphs];
                                    next[i] = e.target.value;
                                    setAbout({ ...about, paragraphs: next });
                                }} 
                                onBlur={() => save(about)} 
                                sx={{ mb: 1 }}
                            />
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                                <IconButton size="small" onClick={() => moveParagraph(i, -1)} disabled={i === 0}><ArrowUpwardIcon /></IconButton>
                                <IconButton size="small" onClick={() => moveParagraph(i, 1)} disabled={i === about.paragraphs.length - 1}><ArrowDownwardIcon /></IconButton>
                                <IconButton size="small" color="error" onClick={() => removeParagraph(i)}><DeleteIcon /></IconButton>
                            </Box>
                        </Paper>
                    ))}
                    <Box sx={{ mt: 2 }}>
                        <TextField 
                            fullWidth 
                            multiline 
                            rows={8} 
                            placeholder="Add a new professional paragraph..." 
                            value={newParagraph} 
                            onChange={(e) => setNewParagraph(e.target.value)} 
                        />
                        <Button variant="contained" sx={{ mt: 1 }} onClick={addParagraph} startIcon={<AddIcon />}>Add Paragraph</Button>
                    </Box>
                </Box>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="h6" gutterBottom color="primary">Manage Contact Details</Typography>
                <Paper variant="outlined" sx={{ p: 3, mb: 3, backgroundColor: 'transparent' }}>
                    <Typography variant="subtitle2" gutterBottom>Add New Contact</Typography>
                    <Grid container spacing={2}>
                        <Grid size={6}>
                            <TextField fullWidth size="small" label="Label (e.g. Email, LinkedIn)" value={newContact.label} onChange={(e) => setNewContact({ ...newContact, label: e.target.value })} />
                        </Grid>
                        <Grid size={6}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Icon</InputLabel>
                                <Select label="Icon" value={newContact.icon} onChange={(e) => setNewContact({ ...newContact, icon: e.target.value })}>
                                    {iconOptions.map(opt => (
                                        <MenuItem key={opt.value} value={opt.value}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>{opt.icon} {opt.label}</Box>
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid size={12}>
                            <TextField fullWidth size="small" label="Display Value (e.g. npanthi718@gmail.com)" value={newContact.value} onChange={(e) => setNewContact({ ...newContact, value: e.target.value })} />
                        </Grid>
                        <Grid size={12}>
                            <TextField fullWidth size="small" label="URL (optional)" value={newContact.url} onChange={(e) => setNewContact({ ...newContact, url: e.target.value })} />
                        </Grid>
                        <Grid size={12}>
                            <Button fullWidth variant="contained" onClick={addContact} startIcon={<AddIcon />}>Add Contact Info</Button>
                        </Grid>
                    </Grid>
                </Paper>

                {about.contactList?.map((c, i) => (
                    <Paper key={i} sx={{ p: 2, mb: 2, backgroundColor: '#222', display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ color: 'primary.main', fontSize: '1.2rem', display: 'flex' }}>{getIcon(c.icon)}</Box>
                        <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="subtitle2">{c.label}: {c.value}</Typography>
                            {c.url && <Typography variant="caption" sx={{ color: '#888' }}>{c.url}</Typography>}
                        </Box>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                            <IconButton size="small" onClick={() => moveContact(i, -1)} disabled={i === 0}><ArrowUpwardIcon /></IconButton>
                            <IconButton size="small" onClick={() => moveContact(i, 1)} disabled={i === about.contactList.length - 1}><ArrowDownwardIcon /></IconButton>
                            <IconButton size="small" color="error" onClick={() => removeContact(i)}><DeleteIcon /></IconButton>
                        </Box>
                    </Paper>
                ))}
            </Grid>

            <Grid size={12}>
                <Divider sx={{ my: 3 }} />
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" gutterBottom color="primary">Extra Links</Typography>
                    <TextField 
                        fullWidth 
                        label="Google Form Link" 
                        value={about.googleFormLink || ''} 
                        onChange={(e) => setAbout({ ...about, googleFormLink: e.target.value })} 
                        margin="normal" 
                    />
                </Box>
                <Button variant="contained" onClick={() => save(about)}>Save About Changes</Button>
            </Grid>
        </Grid>
    );
}
