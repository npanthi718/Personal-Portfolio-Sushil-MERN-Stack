import React, { useState, useEffect } from 'react';
import styles from './Home.module.css';
import SkillCard from '../../components/SkillCard/SkillCard';
import ProjectCard from '../../components/ProjectCard/ProjectCard';
import CourseCard from '../../components/CourseCard/CourseCard';
import EducationCard from '../../components/EducationCard/EducationCard';
import { motion, AnimatePresence } from 'framer-motion';
import { ReactTyped } from 'react-typed';
import { API_URL } from '../../config';

import { FaEnvelope, FaPhone, FaLinkedin, FaGithub, FaLink, FaTwitter, FaInstagram, FaGlobe, FaBriefcase, FaCalendarAlt, FaMapMarkerAlt, FaBuilding, FaFileAlt, FaTrophy, FaUsers, FaBook, FaUniversity as FaUniversityPaper } from 'react-icons/fa';
import Popup from '../../components/Popup/Popup';

const iconMap = {
    'email': FaEnvelope,
    'phone': FaPhone,
    'linkedin': FaLinkedin,
    'github': FaGithub,
    'twitter': FaTwitter,
    'instagram': FaInstagram,
    'website': FaGlobe,
    'link': FaLink,
};

// Fallback photo if none uploaded
const FALLBACK_PHOTO = import.meta.env.VITE_CLOUDINARY_URL; 

function Home() {
    const [hero, setHero] = useState(null);
    const [about, setAbout] = useState(null);
    const [skills, setSkills] = useState({});
    const [projects, setProjects] = useState([]);
    const [experience, setExperience] = useState([]);
    const [additionalExperience, setAdditionalExperience] = useState([]);
    const [education, setEducation] = useState([]);
    const [achievements, setAchievements] = useState([]);
    const [courses, setCourses] = useState([]);
    const [researchPapers, setResearchPapers] = useState([]);

    const [error, setError] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', message: '' });
    const [feedback, setFeedback] = useState('');
    const [popupMessage, setPopupMessage] = useState('');

    const handlePaperLinkClick = (e, link) => {
        if (!link) {
            e.preventDefault();
            setPopupMessage('The paper is on press, not published yet, only presented in the publication as of now.');
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleDownload = async (url) => {
        if (!url) {
            setPopupMessage('Resume not uploaded yet by Admin');
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
            setPopupMessage('Failed to download resume.');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_URL}/api/contact`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            if (!res.ok) throw new Error('Failed to submit');
            setFormData({ name: '', email: '', message: '' });
            setFeedback("Thank you! Form submitted. We'll reach out within 48 hours.");
        } catch (err) {
            setFeedback('Submission failed. Please try again.');
        } finally {
            setTimeout(() => setFeedback(''), 4000);
        }
    };

    useEffect(() => {
        const fetchSection = async (endpoint, setter, isSingle = false) => {
            try {
                const res = await fetch(`${API_URL}/api/${endpoint}${isSingle ? '/single' : ''}`);
                if (!res.ok) throw new Error('Failed to fetch');
                const data = await res.json();
                if (data) {
                    if (endpoint === 'skills') {
                        // Group skills by category
                        const grouped = data.reduce((acc, s) => {
                            const cat = s.category || 'Uncategorized';
                            if (!acc[cat]) acc[cat] = [];
                            acc[cat].push(s);
                            return acc;
                        }, {});
                        setter(grouped);
                    } else {
                        setter(data);
                    }
                }
                setError(false);
            } catch (err) {
                console.error(`Failed to fetch ${endpoint}:`, err);
                setError(true);
            }
        };

        fetchSection('hero', setHero, true);
        fetchSection('about', setAbout, true);
        fetchSection('skills', setSkills);
        fetchSection('projects', setProjects);
        fetchSection('experience', setExperience);
        fetchSection('additional-experience', setAdditionalExperience);
        fetchSection('education', setEducation);
        fetchSection('achievements', setAchievements);
        fetchSection('courses', setCourses);
        fetchSection('papers', setResearchPapers);

        const es = new EventSource(`${API_URL}/api/events`, { withCredentials: true });
        const updateMap = {
            'hero-update': (data) => setHero(data),
            'about-update': (data) => setAbout(data),
            'skills-update': () => fetchSection('skills', setSkills),
            'projects-update': () => fetchSection('projects', setProjects),
            'experience-update': () => fetchSection('experience', setExperience),
            'additional-experience-update': () => fetchSection('additional-experience', setAdditionalExperience),
            'education-update': () => fetchSection('education', setEducation),
            'achievements-update': () => fetchSection('achievements', setAchievements),
            'courses-update': () => fetchSection('courses', setCourses),
            'papers-update': () => fetchSection('papers', setResearchPapers),
        };

        Object.entries(updateMap).forEach(([event, handler]) => {
            es.addEventListener(event, (e) => {
                const data = JSON.parse(e.data);
                handler(data);
            });
        });

        return () => es.close();
    }, []);

    if (error) return (
        <div className={styles.errorContainer}>
            <h2>Oops! Backend is not responding.</h2>
            <p>Please make sure the backend server is running on port 5000.</p>
            <button onClick={() => window.location.reload()}>Retry</button>
        </div>
    );

    if (!hero) return (
        <div className={styles.loadingContainer}>
            <div className={styles.loader}></div>
            <p>Loading your portfolio...</p>
        </div>
    );

    return (
        <div className={styles.homeContainer}>
            <AnimatePresence>
                {popupMessage && <Popup message={popupMessage} onClose={() => setPopupMessage('')} />}
            </AnimatePresence>
            <motion.section
                id="home"
                className={styles.home}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
            >
                <div className={styles.intro}>
                    <motion.img
                        src={hero.photoLink || FALLBACK_PHOTO}
                        alt="Sushil Panthi"
                        className={styles.profileImage}
                        crossOrigin="anonymous"
                        initial={{ opacity: 0, x: -100 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.7, delay: 0.6, type: 'spring', stiffness: 80 }}
                    />
                    <div className={styles.text}>
                        <motion.h1
                            className={styles.name}
                            initial={{ opacity: 0, y: -50 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7, delay: 0.8, type: 'spring', stiffness: 100 }}
                        >
                            <ReactTyped
                                strings={[hero.title || "Hi, I'm Sushil Panthi"]}
                                typeSpeed={90}
                                backSpeed={0}
                                startDelay={600}
                                loop={false}
                                showCursor={false}
                            />
                        </motion.h1>

                        <motion.p
                            className={styles.tagline}
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7, delay: 1.0, type: 'spring', stiffness: 100 }}
                        >
                            <span id="hero-subtitle">
                                <ReactTyped
                                    strings={hero.subtitles || [`Full Stack Developer (MERN)`, `Power BI Developer`]}
                                    typeSpeed={90}
                                    backSpeed={40}
                                    startDelay={1200}
                                    backDelay={1600}
                                    loop={true}
                                    showCursor={false}
                                />
                                {' '}|{' '}
                                <ReactTyped
                                    strings={[hero.relocation || `Open to Relocation`]}
                                    typeSpeed={90}
                                    loop={false}
                                    showCursor={false}
                                />
                            </span>
                        </motion.p>
                        <motion.p
                            className={styles.overview}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.7, delay: 1.2 }}
                        >
                            {hero.overview}
                        </motion.p>
                        {hero.resumeLink ? (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.7, delay: 1.4 }}
                                style={{ marginTop: '2rem' }}
                            >
                                <button onClick={() => handleDownload(hero.resumeLink)} className={styles.resumeButton}>
                                    Download Resume
                                </button>
                            </motion.div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.7, delay: 1.4 }}
                                style={{ marginTop: '2rem', color: '#888', fontStyle: 'italic' }}
                            >
                                Resume will be available soon (Admin is uploading...)
                            </motion.div>
                        )}
                    </div>
                </div>
            </motion.section>

            {about && (
                <motion.section
                    id="about"
                    className={styles.about}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                >
                    <motion.h2
                        className={styles.sectionTitle}
                        initial={{ opacity: 0, y: -30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                    >
                        About Me
                    </motion.h2>
                    <motion.div
                        className={styles.content}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.6 }}
                    >
                        {about.paragraphs?.map((p, i) => <p key={i}>{p}</p>)}

                        <motion.div
                            className={styles.aboutContactDetails}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.8 }}
                        >
                            <h3>Contact Information</h3>
                            <ul className={styles.contactList}>
                                {(about.contactList || []).map((c, i) => {
                                    const Icon = iconMap[c.icon] || FaLink;
                                    return (
                                        <li key={i} className={styles.contactListItem}>
                                            <Icon className={styles.contactIcon} />
                                            <strong>{c.label}:</strong> 
                                            {c.url ? (
                                                <a href={c.url} target="_blank" rel="noopener noreferrer">{c.value}</a>
                                            ) : (
                                                <span>{c.value}</span>
                                            )}
                                        </li>
                                    );
                                })}
                            </ul>
                        </motion.div>
                    </motion.div>
                </motion.section>
            )}

            {Object.keys(skills).length > 0 && (
                <motion.section
                    id="skills"
                    className={styles.skills}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                >
                    <motion.h2
                        className={styles.sectionTitle}
                        initial={{ opacity: 0, y: -30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                    >
                        Skills & Expertise
                    </motion.h2>
                    <div className={styles.categorizedSkills}>
                        {Object.entries(skills).map(([category, skillList], index) => (
                            <div key={index} className={styles.skillCategory}>
                                <h3 className={styles.skillCategoryTitle}>{category}</h3>
                                <motion.div
                                    className={styles.skillsGrid}
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6, delay: 0.6, staggerChildren: 0.1 }}
                                >
                                    {Array.isArray(skillList) && skillList.map((skill, skillIndex) => (
                                        <SkillCard key={skillIndex} skill={skill} />
                                    ))}
                                </motion.div>
                            </div>
                        ))}
                    </div>
                </motion.section>
            )}

            {projects.length > 0 && (
                <motion.section
                    id="projects"
                    className={styles.projects}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                >
                    <motion.h2
                        className={styles.sectionTitle}
                        initial={{ opacity: 0, y: -30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                    >
                        Projects
                    </motion.h2>
                    <motion.div
                        className={styles.projectsGrid}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.6, staggerChildren: 0.2 }}
                    >
                        {projects.map((project, index) => (
                            <ProjectCard key={index} project={project} />
                        ))}
                    </motion.div>
                </motion.section>
            )}

            {experience.length > 0 && (
                <motion.section
                    id="experience"
                    className={styles.experience}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                >
                    <motion.h2
                        className={styles.sectionTitle}
                        initial={{ opacity: 0, y: -30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                    >
                        Experience
                    </motion.h2>
                    <motion.div
                        className={styles.experienceList}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.6, staggerChildren: 0.2 }}
                    >
                        {experience.map((exp, index) => (
                            <motion.div
                                className={styles.experienceItem}
                                key={index}
                                variants={{
                                    hidden: { opacity: 0, y: 20 },
                                    visible: { opacity: 1, y: 0 },
                                }}
                            >
                                <h3 className={styles.jobTitle}><FaBriefcase style={{ marginRight: '8px', color: 'var(--accent-color)' }} />{exp.title}</h3>
                                <h4 className={styles.companyName}><FaBuilding style={{ marginRight: '8px', color: '#888' }} />{exp.company}</h4>
                                <p className={styles.dateLocation}>
                                    <span style={{ display: 'inline-flex', alignItems: 'center', marginRight: '15px' }}><FaCalendarAlt style={{ marginRight: '5px' }} />{exp.date}</span>
                                    <span style={{ display: 'inline-flex', alignItems: 'center' }}><FaMapMarkerAlt style={{ marginRight: '5px' }} />{exp.location}</span>
                                </p>
                                <ul className={styles.descriptionList}>
                                    {exp.description?.map((desc, descIndex) => (
                                        <li key={descIndex} className={styles.descriptionItem}>{desc}</li>
                                    ))}
                                </ul>
                            </motion.div>
                        ))}
                    </motion.div>
                </motion.section>
            )}

            {additionalExperience.length > 0 && (
                <motion.section
                    id="additional-experience"
                    className={`${styles.experience} ${styles.additionalExperience}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                >
                    <motion.h2
                        className={styles.sectionTitle}
                        initial={{ opacity: 0, y: -30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                    >
                        Additional Experience
                    </motion.h2>
                    <motion.div
                        className={styles.experienceList}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.6, staggerChildren: 0.2 }}
                    >
                        {additionalExperience.map((exp, index) => (
                            <motion.div
                                className={styles.experienceItem}
                                key={index}
                                variants={{
                                    hidden: { opacity: 0, y: 20 },
                                    visible: { opacity: 1, y: 0 },
                                }}
                            >
                                <h3 className={styles.jobTitle}><FaBriefcase style={{ marginRight: '8px', color: 'var(--accent-color)' }} />{exp.title}</h3>
                                <h4 className={styles.companyName}><FaBuilding style={{ marginRight: '8px', color: '#888' }} />{exp.company}</h4>
                                <p className={styles.dateLocation}>
                                    <span style={{ display: 'inline-flex', alignItems: 'center', marginRight: '15px' }}><FaCalendarAlt style={{ marginRight: '5px' }} />{exp.date}</span>
                                    <span style={{ display: 'inline-flex', alignItems: 'center' }}><FaMapMarkerAlt style={{ marginRight: '5px' }} />{exp.location}</span>
                                </p>
                                <ul className={styles.descriptionList}>
                                    {exp.description?.map((desc, descIndex) => (
                                        <li key={descIndex} className={styles.descriptionItem}>{desc}</li>
                                    ))}
                                </ul>
                            </motion.div>
                        ))}
                    </motion.div>
                </motion.section>
            )}

            {education.length > 0 && (
                <motion.section
                    id="education"
                    className={styles.education}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                >
                    <motion.h2
                        className={styles.sectionTitle}
                        initial={{ opacity: 0, y: -30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                    >
                        Education
                    </motion.h2>
                    <motion.div
                        className={styles.educationList}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.6, staggerChildren: 0.2 }}
                    >
                        {education.map((edu, index) => (
                            <EducationCard key={index} education={edu} />
                        ))}
                    </motion.div>
                </motion.section>
            )}

            {achievements.length > 0 && (
                <motion.section
                    id="achievements"
                    className={styles.experience}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                >
                    <motion.h2
                        className={styles.sectionTitle}
                        initial={{ opacity: 0, y: -30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                    >
                        Achievements & Extracurricular Activities
                    </motion.h2>
                    <motion.div
                        className={styles.experienceList}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.6, staggerChildren: 0.2 }}
                    >
                        {achievements.map((achievement, index) => (
                            <motion.div
                                className={styles.experienceItem}
                                key={index}
                                variants={{
                                    hidden: { opacity: 0, y: 20 },
                                    visible: { opacity: 1, y: 0 },
                                }}
                            >
                                <h3 className={styles.jobTitle}><FaTrophy style={{ marginRight: '8px', color: 'var(--accent-color)' }} />{achievement.title}</h3>
                                <h4 className={styles.companyName}><FaUsers style={{ marginRight: '8px', color: '#888' }} />{achievement.company}</h4>
                                {achievement.date && <p className={styles.dateLocation}><FaCalendarAlt style={{ marginRight: '5px' }} />{achievement.date} {achievement.location ? <>| <FaMapMarkerAlt style={{ marginRight: '5px' }} />{achievement.location}</> : ''}</p>}
                                <ul className={styles.descriptionList}>
                                    {achievement.description?.map((desc, descIndex) => (
                                        <li key={descIndex} className={styles.descriptionItem}>{desc}</li>
                                    ))}
                                </ul>
                            </motion.div>
                        ))}
                    </motion.div>
                </motion.section>
            )}

            {courses.length > 0 && (
                <motion.section
                    id="courses"
                    className={styles.courses}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                >
                    <motion.h2
                        className={styles.sectionTitle}
                        initial={{ opacity: 0, y: -30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                    >
                        Courses
                    </motion.h2>
                    <motion.div
                        className={styles.courseList}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.6, staggerChildren: 0.2 }}
                    >
                        {courses.map((course, index) => (
                            <CourseCard key={index} course={course} />
                        ))}
                    </motion.div>
                </motion.section>
            )}

            {researchPapers.length > 0 && (
                <motion.section
                    id="Papers"
                    className={styles.experience}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                >
                    <motion.h2
                        className={styles.sectionTitle}
                        initial={{ opacity: 0, y: -30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                    >
                        Research Papers
                    </motion.h2>
                    <motion.div
                        className={styles.PaperList}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.6, staggerChildren: 0.2 }}
                    >
                        {researchPapers.map((papers, index) => (
                            <motion.div
                                className={styles.PaperItem}
                                key={index}
                                variants={{
                                    hidden: { opacity: 0, y: 20 },
                                    visible: { opacity: 1, y: 0 },
                                }}
                            >
                                <h3 className={styles.PaperTitle}><FaBook style={{ marginRight: '8px', color: 'var(--accent-color)' }} />{papers.title}</h3>
                                <h4 className={styles.OrganizerName}><FaUniversityPaper style={{ marginRight: '8px', color: '#888' }} />{papers.organizer}</h4>
                                <h5 className={styles.PaperList}><FaBuilding style={{ marginRight: '8px', color: '#888' }} />{papers.institution}</h5>
                                <p className={styles.dateLocation}><FaCalendarAlt style={{ marginRight: '5px' }} />{papers.date} | <FaMapMarkerAlt style={{ marginRight: '5px' }} />{papers.location}</p>
                                <ul className={styles.descriptionList}>
                                    {papers.description?.map((desc, descIndex) => (
                                        <li key={descIndex} className={styles.descriptionItem}>{desc}</li>
                                    ))}
                                </ul>
                                <div className={styles.paperLinkContainer} style={{ marginTop: '1rem' }}>
                                    <a 
                                        href={papers.link || '#'} 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        className={styles.paperLink}
                                        style={{
                                            display: 'inline-flex', 
                                            alignItems: 'center', 
                                            gap: '8px', 
                                            color: 'var(--accent-color)', 
                                            textDecoration: 'none', 
                                            fontWeight: 'bold',
                                            cursor: papers.link ? 'pointer' : 'default'
                                        }}
                                        onClick={(e) => handlePaperLinkClick(e, papers.link)}
                                    >
                                        <FaFileAlt /> View Published Paper
                                    </a>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </motion.section>
            )}

            <motion.section
                id="contact"
                className={styles.contact}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
            >
                <motion.h2
                    className={styles.sectionTitle}
                    initial={{ opacity: 0, y: -30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                >
                    Contact Me
                </motion.h2>
                <motion.div
                    className={styles.contactInfo}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                >
                    <p className={styles.contactText}>
                        Feel free to reach out to me for any questions or opportunities! Or use the form below to get in touch 'Within 48 hours' .
                    </p>

                    <motion.form
                        onSubmit={handleSubmit}
                        className={styles.contactForm}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.8 }}
                    >
                        <div className={styles.formGroup}>
                            <label htmlFor="name" className={styles.formLabel}>Name</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                className={styles.formInput}
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="email" className={styles.formLabel}>Email</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                className={styles.formInput}
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="message" className={styles.formLabel}>Message</label>
                            <textarea
                                id="message"
                                name="message"
                                rows="5"
                                className={styles.formTextarea}
                                value={formData.message}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <motion.button
                            type="submit"
                            className={styles.submitButton}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            transition={{ duration: 0.3 }}
                        >
                            Get Connected
                        </motion.button>
                    </motion.form>
                    {feedback && (
                        <motion.div
                            className={styles.feedbackMessage}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            transition={{ duration: 0.5 }}
                        >
                            {feedback}
                        </motion.div>
                    )}

                    {about?.googleFormLink && (
                        <motion.div 
                            className={styles.googleFormBox}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 1.0 }}
                        >
                            <span className={styles.googleFormText}>
                                🚀 For a faster response (within <strong>2 hours</strong>), fill out the attached Google form:
                            </span>
                            <a
                                href={about.googleFormLink}
                                target="_blank"
                                rel="noreferrer"
                                className={styles.googleFormButton}
                            >
                                Get in Touch with Sushil
                            </a>
                        </motion.div>
                    )}
                </motion.div>
            </motion.section>
        </div>
    );
}

export default Home;
