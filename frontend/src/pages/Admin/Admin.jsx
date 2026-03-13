import React, { useState, useEffect } from 'react';
import styles from './Admin.module.css';
import ProjectsEditor from './ProjectsEditor';
import ExperienceEditor from './ExperienceEditor';
import CoursesEditor from './CoursesEditor';
import PapersEditor from './PapersEditor';
import ContactsViewer from './ContactsViewer';
import SkillsEditor from './SkillsEditor';
import EducationEditor from './EducationEditor';
import AchievementsEditor from './AchievementsEditor';
import AdditionalExperienceEditor from './AdditionalExperienceEditor';
import AboutEditor from './AboutEditor';
import HomeEditor from './HomeEditor';
import NavManager from './NavManager';
import DynamicEditor from './DynamicEditor';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../../config';

import { 
    Snackbar, Alert, Tabs, Tab, Box, Typography, 
    Container, ThemeProvider, createTheme, CssBaseline, Button
} from '@mui/material';

const darkTheme = createTheme({
    palette: {
        mode: 'dark',
        primary: { main: '#00bcd4' }, // Teal accent
        secondary: { main: '#1e1e1e' },
        background: { default: '#121212', paper: '#1e1e1e' },
        error: { main: '#f44336' },
    },
    typography: {
        fontFamily: "'Arial', sans-serif",
    },
});

export default function Admin() {
    const [tab, setTab] = useState(0);
    const [navItems, setNavItems] = useState([]);
    const [customSections, setCustomSections] = useState([]);
    const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' });
    const navigate = useNavigate();

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const res = await fetch(`${API_URL}/api/admin/verify`, { credentials: 'include' });
                if (res.status === 401) {
                    navigate('/login');
                }
            } catch (err) {
                console.error('Auth check failed:', err);
                navigate('/login');
            }
        };
        checkAuth();
        loadNav();
        loadCustomSections();
    }, [navigate]);

    const loadNav = async () => {
        try {
            const res = await fetch(`${API_URL}/api/nav`);
            const data = await res.json();
            setNavItems(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Failed to load nav:', err);
        }
    };

    const loadCustomSections = async () => {
        try {
            const res = await fetch(`${API_URL}/api/custom-sections`);
            const data = await res.json();
            setCustomSections(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Failed to load custom sections:', err);
        }
    };

    const handleCloseSnack = () => setSnack({ ...snack, open: false });

    const handleLogout = async () => {
        try {
            await fetch(`${API_URL}/api/admin/logout`, { method: 'POST', credentials: 'include' });
            navigate('/login');
        } catch (err) {
            console.error('Logout failed:', err);
        }
    };

    const renderEditor = (item) => {
        if (!item || !item.icon || !item.label) return <Typography color="error">Invalid nav item</Typography>;
        const icon = item.icon.toLowerCase();
        const label = item.label.toLowerCase();

        if (icon === 'home' || label.includes('home')) return <HomeEditor setSnack={setSnack} />;
        if (icon === 'about' || label.includes('about')) return <AboutEditor setSnack={setSnack} />;
        if (icon === 'skill' || label.includes('skill')) return <SkillsEditor setSnack={setSnack} />;
        if (icon === 'project' || label.includes('project')) return <ProjectsEditor setSnack={setSnack} />;
        if (icon === 'experience' || label.includes('experience')) return <ExperienceEditor setSnack={setSnack} />;
        if (icon === 'education' || label.includes('education')) return <EducationEditor setSnack={setSnack} />;
        if (icon === 'course' || label.includes('course')) return <CoursesEditor setSnack={setSnack} />;
        if (icon === 'achievement' || label.includes('achievement')) return <AchievementsEditor setSnack={setSnack} />;
        if (icon === 'paper' || label.includes('paper')) return <PapersEditor setSnack={setSnack} />;
        if (label.includes('add') || label.includes('additional')) return <AdditionalExperienceEditor setSnack={setSnack} />;
        return null;
    };

    return (
        <ThemeProvider theme={darkTheme}>
            <CssBaseline />
            <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default', pt: 4, pb: 8 }}>
                <Container maxWidth="xl">
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                        <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                            Portfolio Admin Panel
                        </Typography>
                        <Button variant="outlined" color="primary" onClick={handleLogout}>Logout</Button>
                    </Box>

                    <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
                        <Tabs 
                            value={tab} 
                            onChange={(e, v) => setTab(v)} 
                            variant="scrollable" 
                            scrollButtons="auto"
                            textColor="primary"
                            indicatorColor="primary"
                        >
                            {navItems.map((item, index) => (
                                <Tab key={item._id} label={item.label} />
                            ))}
                            {customSections.map((section, index) => (
                                <Tab key={section._id} label={section.label} />
                            ))}
                            <Tab label="Manage Nav" />
                            <Tab label="Contact Inbox" />
                        </Tabs>
                    </Box>

                    <Box sx={{ mt: 2 }}>
                        {tab < navItems.length ? (
                            renderEditor(navItems[tab])
                        ) : tab < navItems.length + customSections.length ? (
                            <DynamicEditor section={customSections[tab - navItems.length]} setSnack={setSnack} />
                        ) : tab === navItems.length + customSections.length ? (
                            <NavManager setSnack={setSnack} loadCustomSections={loadCustomSections} />
                        ) : (
                            <ContactsViewer setSnack={setSnack} />
                        )}
                    </Box>
                </Container>
            </Box>

            <Snackbar 
                open={snack.open} 
                autoHideDuration={4000} 
                onClose={handleCloseSnack}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert onClose={handleCloseSnack} severity={snack.severity} sx={{ width: '100%' }}>
                    {snack.message}
                </Alert>
            </Snackbar>
        </ThemeProvider>
    );
}
