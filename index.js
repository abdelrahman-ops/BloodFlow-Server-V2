import express from 'express';
import 'dotenv/config';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import morgan from 'morgan';

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

import { notFound, errorHandler } from './middlewares/error.js';
import routes from './routes/index.js';
import connectDB from './config/db.js';

// Get __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create express app
const app = express();

// Connect to DB only once
let isConnected = false;
const connectOnce = async () => {
  if (!isConnected) {
    await connectDB();
    isConnected = true;
  }
};

// Middleware
app.use(
  cors({
    origin: [
      'http://localhost:5173',
      'https://blood-flow.vercel.app',
      'https://blood-flow-server-v2.vercel.app'
    ],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('dev'));

// Routes
app.get('/', (req, res) => res.send('Server is up and running'));
app.get('/health', (req, res) => res.send('OK'));
app.get('/test', (req, res) => {
  res.json({ message: 'Test successful', timestamp: new Date() });
});

app.use('/api', routes);

// Static
app.use('/images', express.static(join(__dirname, 'public/images')));
app.use('/users', express.static(join(__dirname, 'public/users')));

// Error handlers
app.use(notFound);
app.use(errorHandler);

// 🧠 THIS IS THE FIX FOR VERCEL
export default async function handler(req, res) {
  await connectOnce(); // connect to DB before handling the request
  app(req, res);        // let Express handle the request
}
