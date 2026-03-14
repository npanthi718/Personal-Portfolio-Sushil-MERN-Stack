import React, { useState } from 'react';
import { 
    Box, TextField, Button, Typography, Paper, Container, 
    ThemeProvider, createTheme, CssBaseline, Snackbar, Alert 
} from '@mui/material';
import { API_URL } from '../../config';
import { useNavigate } from 'react-router-dom';

const darkTheme = createTheme({
    palette: {
        mode: 'dark',
        primary: { main: '#00bcd4' },
        background: { default: '#121212', paper: '#1e1e1e' },
    },
});

export default function Login() {
    const [form, setForm] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [snack, setSnack] = useState({ open: false, message: '', severity: 'info' });
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/admin/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
                credentials: 'include'
            });
            const data = await res.json();
            if (res.ok) {
                if (data.token) {
                    localStorage.setItem('adminToken', data.token);
                }
                setSnack({ open: true, message: 'Logged in successfully!', severity: 'success' });
                setTimeout(() => navigate('/admin'), 1000);
            } else {
                setSnack({ open: true, message: data.error || 'Login failed', severity: 'error' });
            }
        } catch (err) {
            setSnack({ open: true, message: 'Server error', severity: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <ThemeProvider theme={darkTheme}>
            <CssBaseline />
            <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', backgroundColor: 'background.default' }}>
                <Container maxWidth="xs">
                    <Paper sx={{ p: 4, borderRadius: 2, border: '1px solid #333' }}>
                        <Typography variant="h5" align="center" gutterBottom color="primary" sx={{ fontWeight: 'bold' }}>
                            Admin Login
                        </Typography>
                        <form onSubmit={handleSubmit}>
                            <TextField
                                fullWidth
                                label="Email or Username"
                                margin="normal"
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                required
                            />
                            <TextField
                                fullWidth
                                label="Password"
                                type="password"
                                margin="normal"
                                value={form.password}
                                onChange={(e) => setForm({ ...form, password: e.target.value })}
                                required
                            />
                            <Button 
                                fullWidth 
                                variant="contained" 
                                type="submit" 
                                disabled={loading}
                                sx={{ mt: 3, py: 1.5, fontWeight: 'bold' }}
                            >
                                {loading ? 'Logging in...' : 'Login'}
                            </Button>
                        </form>
                    </Paper>
                </Container>
            </Box>
            <Snackbar 
                open={snack.open} 
                autoHideDuration={4000} 
                onClose={() => setSnack({ ...snack, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert severity={snack.severity} sx={{ width: '100%' }}>
                    {snack.message}
                </Alert>
            </Snackbar>
        </ThemeProvider>
    );
}
