import React from 'react';
import styles from './SkillCard.module.css';
import { FaReact, FaPython, FaJava, FaDatabase, FaHtml5, FaCss3Alt, FaJs, FaChartBar, FaChartLine, FaFileExcel, FaGitAlt, FaMicrosoft, FaUserFriends, FaUsers, FaCommentDots, FaPuzzlePiece, FaClock, FaNodeJs, FaCode, FaTools, FaBrain } from 'react-icons/fa';
import { SiMongodb, SiExpress, SiTailwindcss, SiMui, SiTypescript, SiCplusplus } from 'react-icons/si';
import { motion } from 'framer-motion';

const iconMap = {
    'react': FaReact,
    'nodejs': FaNodeJs,
    'mongodb': SiMongodb,
    'express': SiExpress,
    'python': FaPython,
    'java': FaJava,
    'js': FaJs,
    'typescript': SiTypescript,
    'html5': FaHtml5,
    'css3': FaCss3Alt,
    'cpp': SiCplusplus,
    'db': FaDatabase,
    'git': FaGitAlt,
    'tailwind': SiTailwindcss,
    'mui': SiMui,
    'powerbi': FaChartBar,
    'excel': FaFileExcel,
    'code': FaCode,
    'tools': FaTools,
    'brain': FaBrain,
    // Legacy mapping
    'MERN Stack': FaReact,
    'Python': FaPython,
    'Java': FaJava,
    'SQL': FaDatabase,
    'HTML': FaHtml5,
    'CSS': FaCss3Alt,
    'JavaScript': FaJs,
    'Power BI': FaChartBar,
    'Microsoft Excel': FaFileExcel,
    'Git': FaGitAlt,
    'Leadership': FaUserFriends,
    'Team Management': FaUsers,
    'Communication': FaCommentDots,
    'Problem Solving': FaPuzzlePiece,
    'Time Management': FaClock,
};


function SkillCard({ skill }) {
    const IconComponent = iconMap[skill.icon] || iconMap[skill.name] || FaCode;

    return (
        <motion.div
            className={styles.skillCard}
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.2 }}
        >
            <div className={styles.iconContainer}>
                <IconComponent className={styles.skillIcon} size={40} />
            </div>
            <h3 className={styles.skillName}>{skill.name}</h3>
            {skill.proficiency && (
                <div className={styles.proficiencyBar}>
                    <motion.div
                        className={styles.proficiencyLevel}
                        style={{ width: `${skill.proficiency}%` }}
                        initial={{ width: 0 }}
                        animate={{ width: `${skill.proficiency}%` }}
                        transition={{ duration: 0.8, ease: "easeInOut" }}
                    />
                </div>
            )}
        </motion.div>
    );
}

export default SkillCard;
