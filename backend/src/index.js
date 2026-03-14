const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const Joi = require('joi');
const cookieParser = require('cookie-parser');

// --- Environment Variable Loading ---
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// --- Critical Environment Variable Validation ---
const requiredEnv = ['MONGODB_URI', 'JWT_SECRET', 'CLOUD_NAME', 'CLOUD_API_KEY', 'CLOUD_API_SECRET'];
const missingEnv = requiredEnv.filter(v => !process.env[v]);
if (missingEnv.length) {
  console.error(`FATAL ERROR: Missing required environment variables: ${missingEnv.join(', ')}`);
  process.exit(1);
}

const { Admin } = require('./models/Admin');
const { NavItem } = require('./models/NavItem');
const { Contact } = require('./models/Contact');
const { Hero } = require('./models/Hero');
const { About } = require('./models/About');
const { Skill } = require('./models/Skill');
const { Project } = require('./models/Project');
const { Experience } = require('./models/Experience');
const { AdditionalExperience } = require('./models/AdditionalExperience');
const { Education } = require('./models/Education');
const { Course } = require('./models/Course');
const { Achievement } = require('./models/Achievement');
const { Paper } = require('./models/Paper');
const { CustomSection } = require('./models/CustomSection');
const { CustomItem } = require('./models/CustomItem');
const auth = require('./middleware/auth');
const { upload, cloudinary } = require('./cloudinary');

const app = express();

app.set('trust proxy', 1); // Trust the first proxy (Render/Vercel)

app.use(express.json());
app.use(cookieParser());
const allowedOrigins = (process.env.FRONTEND_URL || '').split(',').map(s => s.trim()).filter(Boolean);
app.use(cors({
  origin: (origin, callback) => {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (/^http:\/\/localhost:\d+$/.test(origin)) return callback(null, true);
    if (/^http:\/\/(10|192)\./.test(origin)) return callback(null, true);
    if (allowedOrigins.length && (allowedOrigins.includes(origin) || allowedOrigins.includes(origin.replace(/\/$/, '')))) return callback(null, true);
    // In production, we should be more restrictive, but for now we'll allow all origins to avoid blocking the user
    return callback(null, true);
  },
  credentials: true // MANDATORY for cookie-based authentication
}));
app.use(rateLimit({ windowMs: 60 * 1000, max: 200 }));

app.get('/', (req, res) => {
  res.json({ ok: true, message: 'Portfolio backend is running' });
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

const clients = [];
function broadcast(event, data) {
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  clients.forEach((res) => res.write(payload));
}

app.get('/api/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();
  clients.push(res);
  req.on('close', () => {
    const idx = clients.indexOf(res);
    if (idx !== -1) clients.splice(idx, 1);
  });
});

app.post('/api/admin/login', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // Updated Joi to be more flexible for identifier (username or email)
    const schema = Joi.object({
      username: Joi.string().optional(),
      email: Joi.string().required(), // Identifier is passed as email
      password: Joi.string().min(6).required(),
    });
    
    const { error } = schema.validate({ username, email, password });
    if (error) {
      console.warn('[Login] Validation error:', error.details[0].message);
      return res.status(400).json({ error: 'Invalid payload' });
    }

    // Search by email if it looks like an email, otherwise search by username
    let query = {};
    if (email && email.includes('@')) {
      query = { email };
    } else {
      query = { username: email }; // Try searching by username if it's not an email
    }

    console.log(`[Login] Attempt for: ${email}`);
    const admin = await Admin.findOne(query);
    if (!admin) {
      console.warn(`[Login] Admin not found for query:`, query);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const ok = await bcrypt.compare(password, admin.passwordHash);
    if (!ok) {
      console.warn(`[Login] Password mismatch for: ${email}`);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ sub: admin._id, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '1d' });

    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie('token', token, {
      httpOnly: true,
      secure: isProduction, // Must be true for sameSite: 'none'
      sameSite: isProduction ? 'none' : 'lax', 
      maxAge: 24 * 60 * 60 * 1000 // 1 day
    });

    console.log(`[Login] Success: ${admin.username}`);
    res.json({ user: { username: admin.username, email: admin.email }, token });
  } catch (e) {
    console.error('[Login] Unexpected error:', e);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/admin/verify', auth, (req, res) => {
  res.status(200).json({ message: 'Authenticated' });
});

app.post('/api/admin/logout', (req, res) => {
  const isProduction = process.env.NODE_ENV === 'production';
  res.clearCookie('token', {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax'
  });
  res.status(200).json({ message: 'Logged out' });
});

app.get('/api/nav', async (req, res) => {
  const items = await NavItem.find().sort({ order: 1 });
  res.json(items);
});

app.post('/api/nav', auth, async (req, res) => {
  const { label, href, order = 0, visible = true } = req.body;
  const schema = Joi.object({
    label: Joi.string().min(1).required(),
    href: Joi.string().min(1).required(),
    order: Joi.number().integer().default(0),
    visible: Joi.boolean().default(true),
  });
  const { error } = schema.validate({ label, href, order, visible });
  if (error) return res.status(400).json({ error: 'Invalid payload' });
  const item = await NavItem.create({ label, href, order, visible });
  const items = await NavItem.find().sort({ order: 1 });
  broadcast('nav-update', items);
  res.status(201).json(item);
});

app.put('/api/nav/:id', auth, async (req, res) => {
  const { id } = req.params;
  const updated = await NavItem.findByIdAndUpdate(id, req.body, { new: true });
  const items = await NavItem.find().sort({ order: 1 });
  broadcast('nav-update', items);
  res.json(updated);
});

app.delete('/api/nav/:id', auth, async (req, res) => {
  const { id } = req.params;
  await NavItem.findByIdAndDelete(id);
  const items = await NavItem.find().sort({ order: 1 });
  broadcast('nav-update', items);
  res.status(204).end();
});

app.put('/api/nav/reorder', auth, async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids)) return res.status(400).json({ error: 'ids array required' });
    
    // Filter out invalid ObjectIds (like 'd1', 'd2' from DEFAULT_ITEMS)
    const validIds = ids.filter(id => mongoose.Types.ObjectId.isValid(id));
    
    if (validIds.length === 0) {
        return res.json({ ok: true, message: 'No valid database items to reorder' });
    }

    const operations = validIds.map((id, index) => ({
      updateOne: { filter: { _id: id }, update: { order: index } }
    }));
    await NavItem.bulkWrite(operations);
    const items = await NavItem.find().sort({ order: 1 });
    broadcast('nav-update', items);
    res.json({ ok: true });
  } catch (e) {
    console.error('Reorder error:', e);
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/contact', async (req, res) => {
  const { name, email, message } = req.body;
  const schema = Joi.object({
    name: Joi.string().min(1).required(),
    email: Joi.string().email().required(),
    message: Joi.string().min(1).required(),
  });
  const { error } = schema.validate({ name, email, message });
  if (error) return res.status(400).json({ error: 'Invalid payload' });
  const contact = await Contact.create({ name, email, message });
  broadcast('contact-new', contact);
  res.status(201).json({ ok: true });
});

app.get('/api/contact/list', auth, async (req, res) => {
  const items = await Contact.find().sort({ createdAt: -1 });
  res.json(items);
});

app.delete('/api/contact/:id', auth, async (req, res) => {
  try {
    await Contact.findByIdAndDelete(req.params.id);
    res.status(204).end();
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// --- Generic CRUD Factory ---
const createCrudRoutes = (model, name) => {
  app.get(`/api/${name}`, async (req, res) => {
    try {
      let sort = { order: 1, createdAt: -1 };
      if (name === 'skills') sort = { categoryOrder: 1, order: 1 };
      const items = await model.find().sort(sort);
      res.json(items);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get(`/api/${name}/single`, async (req, res) => {
    try {
      const item = await model.findOne();
      res.json(item);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post(`/api/${name}`, auth, async (req, res) => {
    try {
      const item = await model.create(req.body);
      broadcast(`${name}-update`, item);
      res.status(201).json(item);
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  });

  app.put(`/api/${name}/reorder`, auth, async (req, res) => {
    try {
      const { ids, updates } = req.body;
      
      if (updates && Array.isArray(updates)) {
        // Handle bulk updates with specific field changes (e.g. for skills category reorder)
        const operations = updates.map(u => ({
          updateOne: {
            filter: { _id: u._id },
            update: u
          }
        }));
        await model.bulkWrite(operations);
      } else if (ids && Array.isArray(ids)) {
        // Handle simple ID list reorder
        const operations = ids.map((id, index) => ({
          updateOne: {
            filter: { _id: id },
            update: { order: index }
          }
        }));
        await model.bulkWrite(operations);
      } else {
        return res.status(400).json({ error: 'ids or updates array required' });
      }
      
      broadcast(`${name}-update`, { reordered: true });
      res.json({ ok: true });
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  });

  app.put(`/api/${name}/single`, auth, async (req, res) => {
    try {
      const item = await model.findOneAndUpdate({}, req.body, { new: true, upsert: true });
      broadcast(`${name}-update`, item);
      res.json(item);
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  });

  app.put(`/api/${name}/:id`, auth, async (req, res) => {
    try {
      const item = await model.findByIdAndUpdate(req.params.id, req.body, { new: true });
      broadcast(`${name}-update`, item);
      res.json(item);
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  });

  app.delete(`/api/${name}/:id`, auth, async (req, res) => {
    try {
      await model.findByIdAndDelete(req.params.id);
      broadcast(`${name}-update`, { deletedId: req.params.id });
      res.status(204).end();
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  });
};

createCrudRoutes(Hero, 'hero');
createCrudRoutes(About, 'about');
createCrudRoutes(Skill, 'skills');
createCrudRoutes(Project, 'projects');
createCrudRoutes(Experience, 'experience');
createCrudRoutes(AdditionalExperience, 'additional-experience');
createCrudRoutes(Education, 'education');
createCrudRoutes(Course, 'courses');
createCrudRoutes(Achievement, 'achievements');
createCrudRoutes(Paper, 'papers');
createCrudRoutes(CustomSection, 'custom-sections');

// Custom Items Route (needs specific sectionId filter)
app.get('/api/custom-items/:sectionId', async (req, res) => {
  const items = await CustomItem.find({ sectionId: req.params.sectionId }).sort({ order: 1 });
  res.json(items);
});

app.post('/api/custom-items', auth, async (req, res) => {
  const item = await CustomItem.create(req.body);
  broadcast(`custom-items-update-${req.body.sectionId}`, item);
  res.status(201).json(item);
});

app.put('/api/custom-items/:id', auth, async (req, res) => {
  const item = await CustomItem.findByIdAndUpdate(req.params.id, req.body, { new: true });
  broadcast(`custom-items-update-${item.sectionId}`, item);
  res.json(item);
});

app.delete('/api/custom-items/:id', auth, async (req, res) => {
  const item = await CustomItem.findByIdAndDelete(req.params.id);
  broadcast(`custom-items-update-${item.sectionId}`, { deletedId: req.params.id });
  res.status(204).end();
});

app.put('/api/custom-items/reorder/:sectionId', auth, async (req, res) => {
  const { ids } = req.body;
  const operations = ids.map((id, index) => ({
    updateOne: { filter: { _id: id }, update: { order: index } }
  }));
  await CustomItem.bulkWrite(operations);
  broadcast(`custom-items-update-${req.params.sectionId}`, { reordered: true });
  res.json({ ok: true });
});

app.post('/api/upload', auth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    
    // Check if user wants to delete old file
    const { oldPublicId, resourceType = 'image' } = req.body;
    if (oldPublicId) {
      try {
        await cloudinary.uploader.destroy(oldPublicId, { resource_type: resourceType });
      } catch (err) {
        console.error('Failed to delete from Cloudinary:', err);
      }
    }

    res.json({
      url: req.file.path,
      publicId: req.file.filename,
    });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Upload failed' });
  }
});

app.post('/api/admin', auth, async (req, res) => {
  const schema = Joi.object({
    username: Joi.string().min(1).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
  });
  const { error } = schema.validate(req.body);
  if (error) return res.status(400).json({ error: 'Invalid payload' });
  const { username, email, password } = req.body;
  const passwordHash = await bcrypt.hash(password, 10);
  const created = await Admin.create({ username, email, passwordHash });
  res.status(201).json({ id: created._id, username, email });
});

app.put('/api/admin/password', auth, async (req, res) => {
  const schema = Joi.object({ password: Joi.string().min(6).required() });
  const { error } = schema.validate(req.body);
  if (error) return res.status(400).json({ error: 'Invalid payload' });
  const passwordHash = await bcrypt.hash(req.body.password, 10);
  await Admin.findByIdAndUpdate(req.user.sub, { passwordHash });
  res.json({ ok: true });
});

async function bootstrap() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error('MONGODB_URI is not defined in environment variables. Please check your .env file.');
  }
  await mongoose.connect(mongoUri);
  console.log('Connected to MongoDB successfully');
  const username = process.env.ADMIN_USER || 'admin';
  const email = process.env.ADMIN_EMAIL || 'admin@sushilpanthi.com';
  const pass = process.env.ADMIN_PASS || 'admin123';
  const passwordHash = await bcrypt.hash(pass, 10);
  const existingByEmail = await Admin.findOne({ email });
  const existingByUsername = await Admin.findOne({ username });
  
  if (existingByEmail) {
    await Admin.updateOne({ _id: existingByEmail._id }, { username, passwordHash });
    console.log(`[Bootstrap] Updated existing admin by email: ${email}`);
  } else if (existingByUsername) {
    await Admin.updateOne({ _id: existingByUsername._id }, { email, passwordHash });
    console.log(`[Bootstrap] Updated existing admin by username: ${username}`);
  } else {
    await Admin.create({ username, email, passwordHash });
    console.log(`[Bootstrap] Created new admin: ${username} (${email})`);
  }


  const port = process.env.PORT || 5000;
  app.listen(port, () => {
    console.log(`Backend running on http://localhost:${port}`);
  });
}

bootstrap().catch((e) => {
  console.error('Failed to start backend', e);
  process.exit(1);
});
