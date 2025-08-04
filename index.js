import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load env variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// App init
const app = express();

// Lazy DB connection (only once per cold start in Vercel)
let isDBConnected = false;

const connectDB = async () => {
  if (isDBConnected) return;

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB connected: ${conn.connection.host}`);
    isDBConnected = true;
  } catch (err) {
    console.error(`MongoDB Error: ${err.message}`);
    throw err;
  }
};

// Middleware
app.use(
  cors({
    origin: [
      'http://localhost:5173',
      'http://localhost:5174',
      'https://blood-flow.vercel.app',
      'https://blood-flow-server-v2.vercel.app',
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

app.use(express.json());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Handle preflight
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH');
    return res.status(200).json({});
  }
  next();
});

// Health check
app.get('/api/health', async (req, res) => {
  try {
    await connectDB();
    res.json({ status: 'ok', timestamp: new Date() });
  } catch (err) {
    res.status(500).json({ message: 'Database connection failed', error: err.message });
  }
});

// API test route
app.get('/api/test', async (req, res) => {
  try {
    await connectDB();
    res.json({ message: 'API is working and DB is connected!' });
  } catch (err) {
    res.status(500).json({ message: 'Error connecting DB', error: err.message });
  }
});

// Root page
app.get('/', (req, res) => {
  res.status(200).send(`
    <html>
      <head><title>BloodFlow API</title></head>
      <body style="font-family:sans-serif;padding:20px;">
        <h1>🚑 BloodFlow API</h1>
        <p>Status: <span style="color:green;font-weight:bold;">Running</span></p>
        <ul>
          <li>GET <code>/api/health</code> - Check health</li>
          <li>GET <code>/api/test</code> - Check DB connection</li>
        </ul>
      </body>
    </html>
  `);
});

// 404 Not Found handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
  });
});

// For Vercel Serverless
export default app;

// For local development only
if (!process.env.VERCEL_ENV) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running locally at http://localhost:${PORT}`);
  });
}
