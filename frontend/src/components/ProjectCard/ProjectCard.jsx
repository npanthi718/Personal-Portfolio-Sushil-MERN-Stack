import React, { useState } from 'react';
import styles from './ProjectCard.module.css';
import { motion, AnimatePresence } from 'framer-motion';
import { FaGithub, FaLink } from 'react-icons/fa';
import Popup from '../Popup/Popup';

function ProjectCard({ project }) {
    const [showSourceCodePopup, setShowSourceCodePopup] = useState(false);
    const [showLiveDemoPopup, setShowLiveDemoPopup] = useState(false);

    const handleGitHubClick = (event) => {
        if (project.githubLink === 'popup') {
            event.preventDefault();
            setShowSourceCodePopup(true);
        }
    };

    const handleLiveDemoClick = (event) => {
        if (!project.liveLink) {
            event.preventDefault();
            setShowLiveDemoPopup(true);
        }
    };

    const closeSourceCodePopup = () => setShowSourceCodePopup(false);
    const closeLiveDemoPopup = () => setShowLiveDemoPopup(false);


    return (
        <motion.div
            className={styles.projectCard}
            whileHover={{ scale: 1.03 }}
            transition={{ duration: 0.2 }}
        >
            <h3 className={styles.projectTitle}>{project.title}</h3>

            <div className={styles.techStack}>
                <h4 className={styles.techStackTitle}>Tech Stack</h4>
                <ul className={styles.techList}>
                    {project.technologies.map((tech, index) => (
                        <li key={index} className={styles.techItem}>{tech}</li>
                    ))}
                </ul>
            </div>

            <div className={styles.description}>
                <h4 className={styles.descriptionTitle}>Key Contributions</h4>
                <ul className={styles.descriptionList}>
                    {project.keyContributions && project.keyContributions.map((contribution, index) => (
                        <li key={index} className={styles.descriptionItem}>{contribution}</li>
                    ))}
                    {project.description && !project.keyContributions && (<li className={styles.descriptionItem}>{project.description}</li>)}
                </ul>
            </div>

            <div className={styles.links}>
                {project.liveLink ? (
                    <motion.a
                        href={project.liveLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.linkButton}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ duration: 0.3 }}
                        onClick={handleLiveDemoClick} // onClick for popup if no link
                    >
                        <FaLink style={{ marginRight: '8px' }} /> Live Demo
                    </motion.a>
                ) : (
                    <motion.button // Changed to button, but now it's always active style
                        className={styles.linkButton} // Removed disabled style
                        whileHover={{ scale: 1.05 }} // Re-enabled hover effect
                        whileTap={{ scale: 0.95 }}    // Re-enabled tap effect
                        transition={{ duration: 0.3 }}
                        onClick={handleLiveDemoClick} // onClick to show popup
                    >
                        <FaLink style={{ marginRight: '8px' }} /> Live Demo
                    </motion.button>
                )}
                {project.githubLink ? (
                    <motion.a
                        href={project.githubLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.linkButton}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ duration: 0.3 }}
                        onClick={handleGitHubClick} // onClick for popup for specific project
                    >
                        <FaGithub style={{ marginRight: '8px' }} /> Source Code
                    </motion.a>
                ) : (
                    <motion.button
                        className={styles.linkButton} // Keep button for source code, for "Coming Soon" message
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ duration: 0.3 }}
                    >
                        <FaGithub style={{ marginRight: '8px' }} /> Source Code
                    </motion.button>
                )}
            </div>

            {/* Popups - Using AnimatePresence for smooth mount/unmount animations */}
            <AnimatePresence>
                {showSourceCodePopup && (
                    <Popup
                        message="Source code for Face Recognition Attendance System is Coming Soon! Work in progress."
                        onClose={closeSourceCodePopup}
                    />
                )}
            </AnimatePresence>
            <AnimatePresence>
                {showLiveDemoPopup && (
                    <Popup
                        message="Live demo for this project is Not deployed yet! Will be deployed soon."
                        onClose={closeLiveDemoPopup}
                    />
                )}
            </AnimatePresence>
        </motion.div>
    );
}

export default ProjectCard;