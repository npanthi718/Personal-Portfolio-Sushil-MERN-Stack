import React from 'react';
import styles from './Popup.module.css';
import { motion, AnimatePresence } from 'framer-motion';

function Popup({ message, onClose }) {
    return (
        <AnimatePresence>
            <motion.div
                className={styles.popupBackdrop}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
            >
                <motion.div
                    className={styles.popupContent}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <p>{message}</p>
                    <button onClick={onClose} className={styles.closeButton}>Close</button>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

export default Popup;
