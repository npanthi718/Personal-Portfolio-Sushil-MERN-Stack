import React from 'react';
import styles from './Footer.module.css';
import { motion } from 'framer-motion';
import { FaLinkedin, FaGithub } from 'react-icons/fa';

function Footer() {
    return (
        <motion.footer
            className={styles.footer}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
        >
            <p>&copy; {new Date().getFullYear()} Sushil Panthi. All Rights Reserved.</p>
            <div className={styles.socialLinks}>
                <a href={import.meta.env.VITE_LINKEDIN_URL} target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
                     <FaLinkedin />
                 </a>
                 <a href={import.meta.env.VITE_GITHUB_URL} target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
                     <FaGithub />
                 </a>
            </div>
        </motion.footer>
    );
}

export default Footer;