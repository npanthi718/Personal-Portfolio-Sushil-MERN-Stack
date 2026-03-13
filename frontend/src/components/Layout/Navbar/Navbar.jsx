import React, { useState, useEffect, useRef } from "react";
import styles from "./Navbar.module.css";
import { FaBars, FaTimes } from "react-icons/fa";
import { API_URL } from "../../../config";
import { Button } from "@mui/material";
import GetAppRoundedIcon from '@mui/icons-material/GetAppRounded';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import InfoRoundedIcon from '@mui/icons-material/InfoRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import FolderSpecialRoundedIcon from '@mui/icons-material/FolderSpecialRounded';
import WorkHistoryRoundedIcon from '@mui/icons-material/WorkHistoryRounded';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import ContactMailRoundedIcon from '@mui/icons-material/ContactMailRounded';
import BusinessRoundedIcon from '@mui/icons-material/BusinessRounded';
import HandshakeRoundedIcon from '@mui/icons-material/HandshakeRounded';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import TerminalRoundedIcon from '@mui/icons-material/TerminalRounded';
import LanguageRoundedIcon from '@mui/icons-material/LanguageRounded';
import StorageRoundedIcon from '@mui/icons-material/StorageRounded';
import BuildRoundedIcon from '@mui/icons-material/BuildRounded';
import AddCircleOutlineRoundedIcon from '@mui/icons-material/AddCircleOutlineRounded';
import ArticleRoundedIcon from '@mui/icons-material/ArticleRounded';

function Navbar({ setSnack }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showNavbar, setShowNavbar] = useState(true);
    const [navItems, setNavItems] = useState([]);
    const lastScrollY = useRef(0);
    const linksRef = useRef(null);
    const logoRef = useRef(null);
    const actionsRef = useRef(null);
    const [collapseDesktop, setCollapseDesktop] = useState(false);

    const toggleMenu = () => {
        setIsMenuOpen((prev) => !prev);
    };
    const closeMenu = () => setIsMenuOpen(false);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            if (currentScrollY > lastScrollY.current && currentScrollY > 50) {
                setShowNavbar(false);
            } else {
                setShowNavbar(true);
            }
            lastScrollY.current = currentScrollY;
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        function checkOverflow() {
            const links = linksRef.current;
            const logo = logoRef.current;
            const actions = actionsRef.current;
            if (!links || !logo || !actions) return;
            const viewport = document.documentElement.clientWidth;
            const reserved = (logo.offsetWidth || 0) + (actions.offsetWidth || 0) + 60; // padding
            const available = Math.max(0, viewport - reserved);
            setCollapseDesktop(links.scrollWidth > available);
        }
        async function loadNav() {
            try {
                const res = await fetch(`${API_URL}/api/nav`);
                const data = await res.json();
                setNavItems(Array.isArray(data) ? data : []);
            } catch {}
        }
        loadNav();
        const es = new EventSource(`${API_URL}/api/events`);
        es.addEventListener('nav-update', (e) => {
            try {
                const data = JSON.parse(e.data);
                setNavItems(Array.isArray(data) ? data : []);
                setTimeout(checkOverflow, 0);
            } catch {}
        });
        window.addEventListener('resize', checkOverflow);
        setTimeout(checkOverflow, 0);
        return () => es.close();
    }, []);

    // Also fetch resume link from hero content
    const [hero, setHero] = useState(null);
    useEffect(() => {
        async function fetchHero() {
            try {
                const res = await fetch(`${API_URL}/api/hero/single`);
                const data = await res.json();
                if (data) setHero(data);
            } catch {}
        }
        fetchHero();
    }, []);

    function renderIcon(item) {
        const iconName = String(item.icon || '').toLowerCase();
        const label = String(item.label || '').toLowerCase();
        
        // Priority to explicit icon name from DB
        if (iconName === 'home') return <HomeRoundedIcon fontSize="small" />;
        if (iconName === 'about') return <InfoRoundedIcon fontSize="small" />;
        if (iconName === 'skill') return <WorkHistoryRoundedIcon fontSize="small" />;
        if (iconName === 'project') return <FolderSpecialRoundedIcon fontSize="small" />;
        if (iconName === 'experience') return <WorkHistoryRoundedIcon fontSize="small" />;
        if (iconName === 'education') return <SchoolRoundedIcon fontSize="small" />;
        if (iconName === 'course') return <MenuBookRoundedIcon fontSize="small" />;
        if (iconName === 'achievement') return <EmojiEventsRoundedIcon fontSize="small" />;
        if (iconName === 'paper') return <ArticleRoundedIcon fontSize="small" />;
        if (iconName === 'contact') return <ContactMailRoundedIcon fontSize="small" />;
        if (iconName === 'company') return <BusinessRoundedIcon fontSize="small" />;
        if (iconName === 'handshake') return <HandshakeRoundedIcon fontSize="small" />;
        if (iconName === 'code') return <CodeRoundedIcon fontSize="small" />;
        if (iconName === 'terminal') return <TerminalRoundedIcon fontSize="small" />;
        if (iconName === 'web') return <LanguageRoundedIcon fontSize="small" />;
        if (iconName === 'db') return <StorageRoundedIcon fontSize="small" />;
        if (iconName === 'tools') return <BuildRoundedIcon fontSize="small" />;
        if (iconName === 'add') return <AddCircleOutlineRoundedIcon fontSize="small" />;

        // Fallback to label matching
        if (label.includes('home')) return <HomeRoundedIcon fontSize="small" />;
        if (label.includes('about')) return <InfoRoundedIcon fontSize="small" />;
        if (label.includes('skill')) return <WorkHistoryRoundedIcon fontSize="small" />;
        if (label.includes('project')) return <FolderSpecialRoundedIcon fontSize="small" />;
        if (label.includes('experience')) return <WorkHistoryRoundedIcon fontSize="small" />;
        if (label.includes('education')) return <SchoolRoundedIcon fontSize="small" />;
        if (label.includes('course')) return <MenuBookRoundedIcon fontSize="small" />;
        if (label.includes('achievement')) return <EmojiEventsRoundedIcon fontSize="small" />;
        if (label.includes('paper')) return <ArticleRoundedIcon fontSize="small" />;
        if (label.includes('contact')) return <ContactMailRoundedIcon fontSize="small" />;
        
        return null;
    }

    const DEFAULT_ITEMS = [
        { _id: 'd1', label: 'Home', href: '#home', visible: true },
        { _id: 'd2', label: 'About', href: '#about', visible: true },
        { _id: 'd3', label: 'Skills', href: '#skills', visible: true },
        { _id: 'd4', label: 'Projects', href: '#projects', visible: true },
        { _id: 'd5', label: 'Experience', href: '#experience', visible: true },
        { _id: 'd6', label: 'Additional Experience', href: '#additional-experience', visible: true },
        { _id: 'd7', label: 'Education', href: '#education', visible: true },
        { _id: 'd8', label: 'Courses', href: '#courses', visible: true },
        { _id: 'd9', label: 'Achievements', href: '#achievements', visible: true },
        { _id: 'd10', label: 'Research Papers', href: '#Papers', visible: true },
        { _id: 'd11', label: 'Contact', href: '#contact', visible: true },
    ];
    const links = (navItems && navItems.length > 0) ? navItems : DEFAULT_ITEMS;
    const handleDownload = async (url) => {
        if (!url) {
            setSnack({ open: true, message: 'Resume not uploaded yet by Admin', severity: 'warning' });
            return;
        }
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error('Network response was not ok');
            const blob = await response.blob();
            const link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.download = 'Sushil_Resume.pdf';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(link.href);
        } catch (error) {
            console.error('Download failed:', error);
            setSnack({ open: true, message: 'Failed to download resume.', severity: 'error' });
        }
    };
    return (
        <nav className={`${styles.navbar} ${!showNavbar ? styles.navbarHidden : ""}`}>
            {isMenuOpen ? (
                <>
                    <div className={styles.sidebarOverlay} onClick={closeMenu} />
                    <div className={`${styles.sidebarMenu} ${styles.sidebarOpen}`}>
                        <button className={styles.sidebarClose} onClick={closeMenu}>
                            <FaTimes size={28} className={styles.burgerIcon} />
                        </button>
                        <ul className={styles.sidebarLinks}>
                            {links.filter(i => i.visible).map((i) => (
                                <li key={i._id}>
                                    <a href={i.href} className={styles.navLink} onClick={closeMenu}>
                                        {renderIcon(i)}{' '}{i.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                        <div className={styles.sidebarActions}>
                            <button
                                className={styles.resumeButton}
                                onClick={() => handleDownload(hero?.resumeLink)}
                            >
                                <GetAppRoundedIcon fontSize="small" />
                                <span>Resume</span>
                            </button>
                        </div>
                    </div>
                </>
            ) : (
                <>
                    <div className={styles.logo} ref={logoRef}>Sushil Panthi</div>
                    <button className={styles.burgerButton} onClick={toggleMenu}>
                        <FaBars size={24} className={styles.burgerIcon} />
                    </button>
                    <ul className={`${styles.navLinks} ${collapseDesktop ? styles.navLinksWrap : ''}`} ref={linksRef}>
                        {links.filter(i => i.visible).map((i) => (
                            <li key={i._id}><a href={i.href} className={styles.navLink}>{renderIcon(i)}{' '}{i.label}</a></li>
                        ))}
                    </ul>
                    <div className={styles.navActions} ref={actionsRef}>
                        <Button 
                            variant="outlined" 
                            size="small" 
                            color="primary" 
                            startIcon={<GetAppRoundedIcon />}
                            onClick={() => handleDownload(hero?.resumeLink)}
                            sx={{ 
                                color: '#61dafb', 
                                borderColor: '#61dafb', 
                                '&:hover': { 
                                    borderColor: '#fff', 
                                    color: '#fff' 
                                }
                            }}
                        >
                            Resume
                        </Button>
                    </div>
                </>
            )}
        </nav>
    );
}

export default Navbar;
