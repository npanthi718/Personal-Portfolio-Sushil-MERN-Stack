import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home/Home';
import Admin from './pages/Admin/Admin';
import Login from './pages/Admin/Login';
import Layout from './components/Layout/Layout';
import ErrorBoundary from './components/ErrorBoundary';
import { Snackbar, Alert } from '@mui/material';
import './styles/global.css';

function App() {
    const [snack, setSnack] = useState({ open: false, message: '', severity: 'info' });

    return (
        <BrowserRouter>
            <ErrorBoundary>
                <Layout setSnack={setSnack}>
                    <Routes>
                        <Route path="/" element={<Home setSnack={setSnack} />} />
                        <Route path="/admin" element={<Admin />} />
                        <Route path="/login" element={<Login />} />
                    </Routes>
                </Layout>
            </ErrorBoundary>
            <Snackbar open={snack.open} autoHideDuration={6000} onClose={() => setSnack({ ...snack, open: false })}>
                <Alert onClose={() => setSnack({ ...snack, open: false })} severity={snack.severity} sx={{ width: '100%' }}>
                    {snack.message}
                </Alert>
            </Snackbar>
        </BrowserRouter>
    );
}

export default App;
