import express from 'express';
import session from 'express-session';
import path from 'path';
import dotenv from 'dotenv';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import phase2Router from './routes';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 8080;

app.set('trust proxy', 1); // Trust NGINX reverse proxy headers

app.use(cors());

app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use(session({
  secret: process.env.AUTH_SECRET || 'secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === 'production', httpOnly: true, sameSite: 'strict', maxAge: 1000 * 60 * 60 * 24 } // 1 day
}));

// Middleware to check authentication
const requireAuth = (req: any, res: any, next: any) => {
  if (req.session.userId) {
    next();
  } else {
    if (req.path.startsWith('/api/')) {
      res.status(401).json({ error: 'Unauthorized' });
    } else {
      res.redirect('/login.html');
    }
  }
};

// Health Checks
app.get('/health', (req, res) => res.status(200).json({ status: 'UP', version: '1.0.0' }));
app.get('/health/live', (req, res) => res.status(200).json({ status: 'UP' }));
app.get('/health/ready', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({ status: 'READY', database: 'CONNECTED' });
  } catch (e) {
    res.status(503).json({ status: 'UNAVAILABLE', database: 'DISCONNECTED' });
  }
});

// API Routes
app.post('/api/login', async (req: any, res: any) => {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { role: true }
    });
    
    if (user && await bcrypt.compare(password, user.passwordHash)) {
      req.session.userId = user.id;
      req.session.role = user.role.name;
      
      // Audit log
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: 'LOGIN',
          module: 'AUTH',
          ipAddress: req.ip,
          details: 'User logged in successfully'
        }
      });
      
      res.json({ success: true, user: { id: user.id, username: user.username, role: user.role.name } });
    } else {
      res.status(200).json({ success: false, error: 'Invalid credentials. Please check your email and password.' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

app.post('/api/logout', async (req: any, res: any) => {
  if (req.session.userId) {
    await prisma.auditLog.create({
      data: {
        userId: req.session.userId,
        action: 'LOGOUT',
        module: 'AUTH',
        ipAddress: req.ip,
        details: 'User logged out'
      }
    });
  }
  req.session.destroy();
  res.json({ success: true });
});

app.get('/api/me', requireAuth, async (req: any, res: any) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.session.userId },
      select: { id: true, username: true, email: true, role: true }
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Phase 2 — Projects & Tenders (all require authentication)
app.use('/api', requireAuth, phase2Router);

// Protect static routes except login
app.use((req, res, next) => {
  if (req.path === '/' || req.path === '/index.html') {
    return requireAuth(req, res, next);
  }
  next();
});

// Serve static files
app.use(express.static(path.join(__dirname, '../public')));

// Fallback for API
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});
// Start server
app.listen(PORT, () => {
  console.log(`PM-SETU Portal Server running at http://localhost:${PORT}`);
});