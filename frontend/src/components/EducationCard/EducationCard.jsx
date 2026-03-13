import React from 'react';
import styles from './EducationCard.module.css';
import { motion } from 'framer-motion';
import { FaGraduationCap, FaUniversity, FaCalendarAlt, FaStar } from 'react-icons/fa';

function EducationCard({ education }) {
    return (
        <motion.div
            className={styles.educationCard}
            variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
            }}
        >
            <h3 className={styles.degree}>
                <FaGraduationCap className={styles.icon} /> {education.degree}
            </h3>
            <h4 className={styles.institution}>
                <FaUniversity className={styles.icon} /> {education.institution}
            </h4>
            <p className={styles.date}>
                <FaCalendarAlt className={styles.icon} /> {education.dates}
            </p>
            {education.cgpa && (
                <p className={styles.cgpa}>
                    <FaStar className={styles.icon} /> CGPA: {education.cgpa}
                </p>
            )}
        </motion.div>
    );
}

export default EducationCard;