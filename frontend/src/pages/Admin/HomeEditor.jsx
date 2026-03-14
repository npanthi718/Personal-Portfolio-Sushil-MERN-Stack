import React, { useState, useEffect } from 'react';
import styles from './Admin.module.css';
import { 
    TextField, Button, Typography, Paper, Box, IconButton, Divider, 
    Grid, CircularProgress, Tooltip
} from '@mui/material';
import { API_URL } from '../../config';
import { apiFetch } from '../../api';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ImageIcon from '@mui/icons-material/Image';
import { motion } from 'framer-motion';
import { ReactTyped } from 'react-typed';

export default function HomeEditor({ setSnack }) {
    const [hero, setHero] = useState({ 
        title: '', subtitles: [], relocation: '', overview: '', 
        resumeLink: '', photoLink: '', resumePublicId: '', photoPublicId: '' 
    });
    const [subtitlesText, setSubtitlesText] = useState('');
    const [uploading, setUploading] = useState({ photo: false, resume: false });
    const [showPreview, setShowPreview] = useState(true);

    const loadHero = async () => {
        try {
            const res = await apiFetch('/api/hero/single');
            if (res.status === 401) {
                // If unauthorized, we might want to handle it, but for now just log
                console.warn('Unauthorized to load hero data');
                return;
            }
            const data = await res.json();
            if (data) {
                setHero(data);
                setSubtitlesText(Array.isArray(data.subtitles) ? data.subtitles.join(', ') : '');
            }
        } catch (err) {
            console.error('Failed to load home data:', err);
        }
    };

    useEffect(() => {
        loadHero();
        const es = new EventSource(`${API_URL}/api/events`, { withCredentials: true });
        es.addEventListener('hero-update', loadHero);
        return () => es.close();
    }, []);

    async function handleFileUpload(e, field) {
        const file = e.target.files[0];
        if (!file) return;

        const isResume = field === 'resumeLink';
        setUploading({ ...uploading, [isResume ? 'resume' : 'photo']: true });

        const formData = new FormData();
        formData.append('file', file);
        const oldPid = isResume ? hero.resumePublicId : hero.photoPublicId;
        if (oldPid) formData.append('oldPublicId', oldPid);
        if (isResume) formData.append('resourceType', 'raw');

        try {
            const res = await apiFetch('/api/upload', {
                method: 'POST',
                body: formData,
            });
            if (res.status === 401) throw new Error('Unauthorized. Please login again.');
            const data = await res.json();
            if (res.ok) {
                const next = { 
                    ...hero, 
                    [field]: data.url, 
                    [isResume ? 'resumePublicId' : 'photoPublicId']: data.publicId 
                };
                setHero(next);
                setSnack({ open: true, message: 'File uploaded! Click Save to apply changes.', severity: 'info' });
            } else {
                throw new Error(data.error || 'Upload failed');
            }
        } catch (err) {
            setSnack({ open: true, message: err.message, severity: 'error' });
        } finally {
            setUploading({ ...uploading, [isResume ? 'resume' : 'photo']: false });
        }
    }

    async function save() {
        try {
            const { _id, createdAt, updatedAt, __v, ...dataToSave } = hero;
            const next = { 
                ...dataToSave, 
                subtitles: typeof subtitlesText === 'string' ? subtitlesText.split(',').map(s => s.trim()).filter(Boolean) : []
            };
            if (!next.title.trim()) {
                setSnack({ open: true, message: 'Title is required', severity: 'warning' });
                return;
            }
            const res = await apiFetch('/api/hero/single', {
                method: 'PUT',
                body: JSON.stringify(next),
            });
            if (res.status === 401) {
                setSnack({ open: true, message: 'Unauthorized. Please login again.', severity: 'error' });
                return;
            }
            if (res.ok) {
                setSnack({ open: true, message: 'Hero content saved!', severity: 'success' });
            } else {
                setSnack({ open: true, message: 'Failed to save hero content', severity: 'error' });
            }
        } catch (err) {
            setSnack({ open: true, message: 'Server error', severity: 'error' });
        }
    }

    return (
        <Box>
            <Grid container spacing={3}>
                <Grid size={{ xs: 12, lg: showPreview ? 7 : 12 }}>
                    <Paper sx={{ p: 4, mb: 3, backgroundColor: '#1e1e1e', color: '#fff', border: '1px solid #333' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                            <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>Manage Home Section</Typography>
                            <Tooltip title={showPreview ? "Hide Preview" : "Show Preview"}>
                                <IconButton onClick={() => setShowPreview(!showPreview)} color="primary">
                                    <VisibilityIcon />
                                </IconButton>
                            </Tooltip>
                        </Box>
                        
                        <Grid container spacing={3}>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField 
                                    fullWidth label="Full Name" 
                                    value={hero.title} 
                                    onChange={(e) => setHero({ ...hero, title: e.target.value })} 
                                    margin="normal" 
                                />
                                <TextField 
                                    fullWidth label="Subtitles (comma separated)" 
                                    value={subtitlesText} 
                                    onChange={(e) => setSubtitlesText(e.target.value)} 
                                    margin="normal" 
                                    helperText="e.g. Full Stack Developer, Data Scientist" 
                                />
                                <TextField 
                                    fullWidth label="Relocation Status" 
                                    value={hero.relocation} 
                                    onChange={(e) => setHero({ ...hero, relocation: e.target.value })} 
                                    margin="normal" 
                                />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField 
                                    fullWidth label="Overview" 
                                    multiline rows={10} 
                                    value={hero.overview} 
                                    onChange={(e) => setHero({ ...hero, overview: e.target.value })} 
                                    margin="normal" 
                                />
                            </Grid>

                            <Grid size={{ xs: 12, md: 6 }}>
                                <Typography variant="subtitle2" sx={{ color: '#aaa', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <ImageIcon fontSize="small" /> Profile Photo
                                </Typography>
                                <Box sx={{ 
                                    p: 2, border: '2px dashed #444', borderRadius: 2, textAlign: 'center',
                                    backgroundColor: '#252525', cursor: 'pointer', position: 'relative',
                                    '&:hover': { borderColor: 'primary.main' }
                                }}>
                                    <input 
                                        type="file" accept="image/*" 
                                        onChange={(e) => handleFileUpload(e, 'photoLink')} 
                                        disabled={uploading.photo}
                                        style={{ opacity: 0, position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', cursor: 'pointer' }}
                                    />
                                    {uploading.photo ? (
                                        <CircularProgress size={24} sx={{ my: 1 }} />
                                    ) : (
                                        <>
                                            <CloudUploadIcon sx={{ fontSize: 30, color: '#666', mb: 1 }} />
                                            <Typography variant="body2" color="textSecondary">
                                                {hero.photoLink ? "Click to Replace Photo" : "Click to Upload Photo"}
                                            </Typography>
                                        </>
                                    )}
                                </Box>
                                {hero.photoLink && (
                                    <Box mt={2} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <img src={hero.photoLink} alt="Preview" crossOrigin="anonymous" style={{ width: 60, height: 60, borderRadius: '50%', objectFit: 'cover', border: '2px solid #333' }} />
                                        <Typography variant="caption" sx={{ color: '#888', maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {hero.photoLink.split('/').pop()}
                                        </Typography>
                                    </Box>
                                )}
                            </Grid>

                            <Grid size={{ xs: 12, md: 6 }}>
                                <Typography variant="subtitle2" sx={{ color: '#aaa', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <PictureAsPdfIcon fontSize="small" /> Resume (PDF)
                                </Typography>
                                <Box sx={{ 
                                    p: 2, border: '2px dashed #444', borderRadius: 2, textAlign: 'center',
                                    backgroundColor: '#252525', cursor: 'pointer', position: 'relative',
                                    '&:hover': { borderColor: 'primary.main' }
                                }}>
                                    <input 
                                        type="file" accept=".pdf" 
                                        onChange={(e) => handleFileUpload(e, 'resumeLink')} 
                                        disabled={uploading.resume}
                                        style={{ opacity: 0, position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', cursor: 'pointer' }}
                                    />
                                    {uploading.resume ? (
                                        <CircularProgress size={24} sx={{ my: 1 }} />
                                    ) : (
                                        <>
                                            <CloudUploadIcon sx={{ fontSize: 30, color: '#666', mb: 1 }} />
                                            <Typography variant="body2" color="textSecondary">
                                                {hero.resumeLink ? "Click to Replace Resume" : "Click to Upload Resume"}
                                            </Typography>
                                        </>
                                    )}
                                </Box>
                                {hero.resumeLink && (
                                    <Box mt={2} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <PictureAsPdfIcon sx={{ fontSize: 40, color: '#f44336' }} />
                                        <Box>
                                            <Typography variant="caption" sx={{ color: '#888', display: 'block', maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {hero.resumeLink.split('/').pop()}
                                            </Typography>
                                            <Button size="small" href={hero.resumeLink} target="_blank" sx={{ textTransform: 'none', p: 0 }}>View PDF</Button>
                                        </Box>
                                    </Box>
                                )}
                            </Grid>
                        </Grid>

                        <Divider sx={{ my: 4, borderColor: '#333' }} />
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <Button 
                                variant="contained" 
                                size="large" 
                                onClick={save} 
                                disabled={uploading.photo || uploading.resume}
                                sx={{ px: 4, fontWeight: 'bold' }}
                            >
                                Save Changes
                            </Button>
                        </Box>
                    </Paper>
                </Grid>

                {showPreview && (
                    <Grid size={{ xs: 12, lg: 5 }}>
                        <Paper sx={{ p: 4, position: 'sticky', top: 20, backgroundColor: '#0a0a0a', color: '#fff', border: '1px solid #333', minHeight: '400px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
                            <Typography variant="overline" sx={{ color: 'primary.main', letterSpacing: 2, mb: 2 }}>Live Preview</Typography>
                            
                            <motion.img
                                src={(typeof hero.photoLink === 'string' && hero.photoLink) ? hero.photoLink : import.meta.env.VITE_CLOUDINARY_URL}
                                alt="Profile"
                                crossOrigin="anonymous"
                                style={{ width: 150, height: 150, borderRadius: '50%', objectFit: 'cover', border: '4px solid #1e1e1e', marginBottom: '1.5rem', boxShadow: '0 0 20px rgba(0,188,212,0.3)' }}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                            />

                            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>{hero.title || "Your Name"}</Typography>
                            
                            <Box sx={{ height: 40, mb: 2 }}>
                                <Typography variant="h6" sx={{ color: 'primary.main' }}>
                                    <ReactTyped
                                        strings={hero.subtitles?.length ? hero.subtitles : ["Full Stack Developer"]}
                                        typeSpeed={50}
                                        backSpeed={30}
                                        loop
                                    />
                                </Typography>
                            </Box>

                            <Typography variant="body2" sx={{ color: '#888', mb: 3, maxWidth: '80%' }}>
                                {hero.overview || "Your professional summary will appear here..."}
                            </Typography>

                            {hero.relocation && (
                                <Typography variant="caption" sx={{ px: 2, py: 0.5, mt: 2, borderRadius: 10, backgroundColor: 'rgba(0,188,212,0.1)', color: 'primary.main', border: '1px solid rgba(0,188,212,0.3)' }}>
                                    {hero.relocation}
                                </Typography>
                            )}

                            {hero.resumeLink && (
                                <Button 
                                    variant="outlined" 
                                    color="primary" 
                                    href={hero.resumeLink} 
                                    target="_blank" 
                                    startIcon={<PictureAsPdfIcon />}
                                    sx={{ mt: 3, textTransform: 'none', borderRadius: '20px', px: 3 }}
                                >
                                    Download Resume
                                </Button>
                            )}
                        </Paper>
                    </Grid>
                )}
            </Grid>
        </Box>
    );
}
