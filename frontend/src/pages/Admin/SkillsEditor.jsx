import React, { useState, useEffect } from 'react';
import styles from './Admin.module.css';
import { TextField, Button, Grid, Typography, Paper, Box, IconButton, LinearProgress, MenuItem, Select, FormControl, InputLabel, Divider } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import { 
    FaReact, FaNodeJs, FaPython, FaJava, FaHtml5, FaCss3Alt, FaJs, FaDatabase, FaGitAlt, FaCode, FaTools, FaBrain, FaFileExcel, FaChartBar,
    FaComments, FaUsers, FaLightbulb, FaUserTie, FaClock
} from 'react-icons/fa';
import { 
    SiMongodb, SiExpress, SiTailwindcss, SiMui, SiTypescript, SiCplusplus 
} from 'react-icons/si';
import { API_URL } from '../../config';

const iconOptions = [
    { name: 'React', value: 'react', icon: <FaReact />, category: 'technical' },
    { name: 'Node.js', value: 'nodejs', icon: <FaNodeJs />, category: 'technical' },
    { name: 'MongoDB', value: 'mongodb', icon: <SiMongodb />, category: 'technical' },
    { name: 'Express', value: 'express', icon: <SiExpress />, category: 'technical' },
    { name: 'Python', value: 'python', icon: <FaPython />, category: 'technical' },
    { name: 'Java', value: 'java', icon: <FaJava />, category: 'technical' },
    { name: 'JavaScript', value: 'js', icon: <FaJs />, category: 'technical' },
    { name: 'TypeScript', value: 'typescript', icon: <SiTypescript />, category: 'technical' },
    { name: 'HTML5', value: 'html5', icon: <FaHtml5 />, category: 'technical' },
    { name: 'CSS3', value: 'css3', icon: <FaCss3Alt />, category: 'technical' },
    { name: 'C++', value: 'cpp', icon: <SiCplusplus />, category: 'technical' },
    { name: 'Database/SQL', value: 'db', icon: <FaDatabase />, category: 'technical' },
    { name: 'Git', value: 'git', icon: <FaGitAlt />, category: 'tools' },
    { name: 'Tailwind', value: 'tailwind', icon: <SiTailwindcss />, category: 'technical' },
    { name: 'Material UI', value: 'mui', icon: <SiMui />, category: 'technical' },
    { name: 'Power BI', value: 'powerbi', icon: <FaChartBar />, category: 'tools' },
    { name: 'Excel', value: 'excel', icon: <FaFileExcel />, category: 'tools' },
    { name: 'Code', value: 'code', icon: <FaCode />, category: 'technical' },
    { name: 'Tools', value: 'tools', icon: <FaTools />, category: 'tools' },
    { name: 'Soft Skills', value: 'brain', icon: <FaBrain />, category: 'soft' },
    { name: 'Communication', value: 'communication', icon: <FaComments />, category: 'soft' },
    { name: 'Teamwork', value: 'teamwork', icon: <FaUsers />, category: 'soft' },
    { name: 'Problem Solving', value: 'problem-solving', icon: <FaLightbulb />, category: 'soft' },
    { name: 'Leadership', value: 'leadership', icon: <FaUserTie />, category: 'soft' },
    { name: 'Time Management', value: 'time-management', icon: <FaClock />, category: 'soft' },
];

export default function SkillsEditor({ setSnack }) {
    const [skills, setSkills] = useState({});
    const [newCategory, setNewCategory] = useState('');
    const [newSkill, setNewSkill] = useState({ category: '', name: '', proficiency: 0, icon: 'code' });
    const [editingSkillId, setEditingSkillId] = useState(null);

    const getFilteredIcons = (categoryName, currentIconValue) => {
        const cat = (categoryName || '').toLowerCase();
        let filtered = [];

        if (cat.includes('technical') || cat.includes('language') || cat.includes('stack')) {
            filtered = iconOptions.filter(o => o.category === 'technical' || o.value === 'code');
        } else if (cat.includes('tool') || cat.includes('platform') || cat.includes('software')) {
            filtered = iconOptions.filter(o => o.category === 'tools' || o.value === 'tools');
        } else if (cat.includes('soft') || cat.includes('personal') || cat.includes('interpersonal')) {
            filtered = iconOptions.filter(o => o.category === 'soft' || o.value === 'brain');
        } else {
            filtered = [...iconOptions];
        }

        // Ensure the current icon is always in the list to prevent MUI warnings
        const currentIconExists = filtered.some(o => o.value === currentIconValue);
        if (currentIconValue && !currentIconExists) {
            const currentIcon = iconOptions.find(o => o.value === currentIconValue);
            if (currentIcon) {
                filtered.push(currentIcon);
            }
        }

        return filtered;
    };

    const loadSkills = async () => {
        try {
            const res = await fetch(`${API_URL}/api/skills`, { credentials: 'include' });
            if (res.status === 401) return;
            const data = await res.json();
            if (Array.isArray(data)) {
                const grouped = data.reduce((acc, s) => {
                    const cat = s.category || 'Uncategorized';
                    if (!acc[cat]) acc[cat] = [];
                    acc[cat].push(s);
                    return acc;
                }, {});
                setSkills(grouped);
            }
        } catch (err) {
            console.error('Failed to load skills:', err);
        }
    };

    useEffect(() => {
        loadSkills();
    }, []);

    async function saveSkill(skill) {
        try {
            const method = skill._id ? 'PUT' : 'POST';
            const url = skill._id ? `${API_URL}/api/skills/${skill._id}` : `${API_URL}/api/skills`;
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(skill),
                credentials: 'include'
            });
            if (res.ok) {
                // Refresh local state
                const refreshRes = await fetch(`${API_URL}/api/skills`, { credentials: 'include' });
                const refreshData = await refreshRes.json();
                const grouped = refreshData.reduce((acc, s) => {
                    const cat = s.category || 'Uncategorized';
                    if (!acc[cat]) acc[cat] = [];
                    acc[cat].push(s);
                    return acc;
                }, {});
                setSkills(grouped);
                setSnack({ open: true, message: 'Skill saved!', severity: 'success' });
            }
        } catch (err) {
            setSnack({ open: true, message: 'Server error', severity: 'error' });
        }
    }

    async function deleteSkill(id) {
        try {
            const res = await fetch(`${API_URL}/api/skills/${id}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            if (res.ok) {
                // Refresh local state
                const refreshRes = await fetch(`${API_URL}/api/skills`, { credentials: 'include' });
                const refreshData = await refreshRes.json();
                const grouped = refreshData.reduce((acc, s) => {
                    const cat = s.category || 'Uncategorized';
                    if (!acc[cat]) acc[cat] = [];
                    acc[cat].push(s);
                    return acc;
                }, {});
                setSkills(grouped);
                setSnack({ open: true, message: 'Skill deleted!', severity: 'success' });
            }
        } catch (err) {
            setSnack({ open: true, message: 'Server error', severity: 'error' });
        }
    }

    const addCategory = () => {
        if (!newCategory.trim()) return;
        if (skills[newCategory.trim()]) return;
        setSkills({ ...skills, [newCategory.trim()]: [] });
        setNewCategory('');
    };

    const removeCategory = (cat) => {
        // Only allow removing empty categories
        if (skills[cat] && skills[cat].length > 0) {
            setSnack({ open: true, message: 'Cannot remove category with skills', severity: 'warning' });
            return;
        }
        const next = { ...skills };
        delete next[cat];
        setSkills(next);
    };

    const moveCategory = async (cat, direction) => {
        const categories = Object.keys(skills);
        const idx = categories.indexOf(cat);
        const targetIdx = idx + direction;
        if (targetIdx < 0 || targetIdx >= categories.length) return;

        const nextCategories = [...categories];
        [nextCategories[idx], nextCategories[targetIdx]] = [nextCategories[targetIdx], nextCategories[idx]];

        // Prepare updates for all skills in both categories
        const updates = [];
        nextCategories.forEach((c, i) => {
            skills[c].forEach(s => {
                updates.push({ ...s, categoryOrder: i });
            });
        });

        // Optimistically update local state
        const nextSkills = {};
        nextCategories.forEach(c => {
            nextSkills[c] = skills[c];
        });
        setSkills(nextSkills);

        try {
            // Bulk update categoryOrder for all skills
            await fetch(`${API_URL}/api/skills/reorder`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ updates }),
                credentials: 'include'
            });
            setSnack({ open: true, message: 'Category order saved!', severity: 'success' });
        } catch (err) {
            setSnack({ open: true, message: 'Failed to save category order', severity: 'error' });
        }
    };

    const addSkill = (cat) => {
        if (!newSkill.name.trim()) return;
        const level = Math.min(100, Math.max(0, Number(newSkill.proficiency) || 0));
        saveSkill({ ...newSkill, category: cat, proficiency: level });
        setNewSkill({ category: '', name: '', proficiency: 0, icon: 'code' });
    };

    const getIcon = (iconName) => {
        const option = iconOptions.find(o => o.value === iconName);
        return option ? option.icon : <FaCode />;
    };

    async function moveSkill(id, direction) {
        // Find the skill and its category
        let category = '';
        let currentIdx = -1;
        for (const cat in skills) {
            const idx = skills[cat].findIndex(s => s._id === id);
            if (idx !== -1) {
                category = cat;
                currentIdx = idx;
                break;
            }
        }
        if (!category) return;

        const list = [...skills[category]];
        const targetIdx = currentIdx + direction;
        if (targetIdx < 0 || targetIdx >= list.length) return;

        // Swap locally for instant feedback
        [list[currentIdx], list[targetIdx]] = [list[targetIdx], list[currentIdx]];
        setSkills({ ...skills, [category]: list });
        
        try {
            // Send all IDs in this category to reorder
            await fetch(`${API_URL}/api/skills/reorder`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids: list.map(s => s._id) }),
                credentials: 'include'
            });
        } catch (err) {
            setSnack({ open: true, message: 'Reorder failed', severity: 'error' });
        }
    }

    return (
        <Box sx={{ p: 3 }}>
            <Grid container spacing={4}>
                <Grid size={{ xs: 12, lg: 7 }}>
                    <Typography variant="h5" gutterBottom color="primary">Manage Skills</Typography>
                    
                    <Box sx={{ mb: 4, p: 2, backgroundColor: '#1a1a1a', borderRadius: 1 }}>
                        <Typography variant="subtitle1" gutterBottom>Add New Category</Typography>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <TextField size="small" placeholder="Category Name (e.g. Frontend)" value={newCategory} onChange={(e) => setNewCategory(e.target.value)} />
                            <Button variant="contained" onClick={addCategory}>Add Category</Button>
                        </Box>
                    </Box>

                    {Object.entries(skills).map(([cat, list], catIdx) => (
                        <Paper key={cat} sx={{ p: 2, mb: 3, backgroundColor: '#1e1e1e' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Typography variant="h6" sx={{ color: 'primary.main' }}>{cat}</Typography>
                                    <Box sx={{ display: 'flex' }}>
                                        <IconButton size="small" disabled={catIdx === 0} onClick={() => moveCategory(cat, -1)}><ArrowUpwardIcon fontSize="small" /></IconButton>
                                        <IconButton size="small" disabled={catIdx === Object.keys(skills).length - 1} onClick={() => moveCategory(cat, 1)}><ArrowDownwardIcon fontSize="small" /></IconButton>
                                    </Box>
                                </Box>
                                <IconButton size="small" color="error" onClick={() => removeCategory(cat)} title="Remove Category"><DeleteIcon fontSize="small" /></IconButton>
                            </Box>

                            <Box sx={{ mb: 2, p: 2, border: '1px solid #333', borderRadius: 1 }}>
                                <Typography variant="body2" gutterBottom>Add Skill to {cat}</Typography>
                                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                    <TextField size="small" placeholder="Skill Name" value={newSkill.category === cat ? newSkill.name : ''} onChange={(e) => setNewSkill({ ...newSkill, category: cat, name: e.target.value })} />
                                    <TextField type="number" size="small" placeholder="%" value={newSkill.category === cat ? newSkill.proficiency : ''} onChange={(e) => setNewSkill({ ...newSkill, category: cat, proficiency: e.target.value })} sx={{ width: 80 }} />
                                    <FormControl size="small" sx={{ width: 120 }}>
                                        <InputLabel>Icon</InputLabel>
                                        <Select
                                            value={newSkill.category === cat ? newSkill.icon : 'code'}
                                            label="Icon"
                                            onChange={(e) => setNewSkill({ ...newSkill, category: cat, icon: e.target.value })}
                                        >
                                            {getFilteredIcons(cat, newSkill.icon).map(o => (
                                                <MenuItem key={o.value} value={o.value}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        {o.icon} {o.name}
                                                    </Box>
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                    <Button variant="contained" size="small" onClick={() => addSkill(cat)}>Add Skill</Button>
                                </Box>
                            </Box>

                            <Grid container spacing={1} sx={{ mt: 1 }}>
                                {list.map((s, idx) => (
                                    <Grid size="auto" key={s._id}>
                                        <Paper sx={{ p: 1, backgroundColor: '#2a2a2a', display: 'flex', alignItems: 'center', gap: 1 }}>
                                            {getIcon(s.icon)}
                                            {editingSkillId === s._id ? (
                                                <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center', flexWrap: 'wrap' }}>
                                                    <TextField size="small" value={s.name} onChange={(e) => {
                                                        const next = { ...s, name: e.target.value };
                                                        const newList = [...list];
                                                        newList[idx] = next;
                                                        setSkills({ ...skills, [cat]: newList });
                                                    }} sx={{ width: 100 }} />
                                                    <TextField type="number" size="small" value={s.proficiency} onChange={(e) => {
                                                        const next = { ...s, proficiency: e.target.value };
                                                        const newList = [...list];
                                                        newList[idx] = next;
                                                        setSkills({ ...skills, [cat]: newList });
                                                    }} sx={{ width: 60 }} />
                                                    <FormControl size="small" sx={{ width: 100 }}>
                                                        <Select
                                                            value={s.icon || 'code'}
                                                            onChange={(e) => {
                                                                const next = { ...s, icon: e.target.value };
                                                                const newList = [...list];
                                                                newList[idx] = next;
                                                                setSkills({ ...skills, [cat]: newList });
                                                            }}
                                                        >
                                                            {getFilteredIcons(cat, s.icon).map(o => (
                                                                <MenuItem key={o.value} value={o.value}>
                                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                        {o.icon}
                                                                    </Box>
                                                                </MenuItem>
                                                            ))}
                                                        </Select>
                                                    </FormControl>
                                                    <IconButton size="small" color="success" onClick={() => {
                                                        saveSkill(s);
                                                        setEditingSkillId(null);
                                                    }}><CheckIcon fontSize="small" /></IconButton>
                                                </Box>
                                            ) : (
                                                <>
                                                    <Typography variant="body2">{s.name} ({s.proficiency}%)</Typography>
                                                    <IconButton size="small" onClick={() => setEditingSkillId(s._id)}><EditIcon fontSize="small" /></IconButton>
                                                </>
                                            )}
                                            <Box sx={{ display: 'flex' }}>
                                                <IconButton size="small" disabled={idx === 0} onClick={() => moveSkill(s._id, -1)}><ArrowUpwardIcon fontSize="small" /></IconButton>
                                                <IconButton size="small" disabled={idx === list.length - 1} onClick={() => moveSkill(s._id, 1)}><ArrowDownwardIcon fontSize="small" /></IconButton>
                                            </Box>
                                            <IconButton size="small" color="error" onClick={() => deleteSkill(s._id)}><DeleteIcon fontSize="small" /></IconButton>
                                        </Paper>
                                    </Grid>
                                ))}
                            </Grid>
                        </Paper>
                    ))}
                </Grid>
                <Grid size={{ xs: 12, lg: 5 }}>
                    <Box sx={{ position: 'sticky', top: 20 }}>
                        <Typography variant="h6" gutterBottom color="primary">Live Preview</Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            {Object.entries(skills).map(([category, skillList]) => (
                                <Paper key={category} sx={{ p: 3, backgroundColor: '#1e1e1e', color: '#fff', border: '1px solid #333' }}>
                                    <Typography variant="subtitle1" sx={{ color: 'primary.main', fontWeight: 'bold', mb: 2 }}>{category}</Typography>
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                                        {skillList.map((skill, idx) => (
                                            <Box key={idx} sx={{ textAlign: 'center', width: 80 }}>
                                                <Box sx={{ fontSize: '2rem', color: 'primary.main', mb: 1 }}>{getIcon(skill.icon)}</Box>
                                                <Typography variant="caption" display="block">{skill.name}</Typography>
                                                <LinearProgress variant="determinate" value={skill.proficiency} sx={{ height: 4, borderRadius: 2, mt: 0.5, backgroundColor: '#333' }} />
                                            </Box>
                                        ))}
                                    </Box>
                                </Paper>
                            ))}
                        </Box>
                    </Box>
                </Grid>
            </Grid>
        </Box>
    );
}
