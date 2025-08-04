import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import connectDB from './config/db.js';
import dotenv from 'dotenv';
import { errorHandler, notFound } from './middlewares/error.js';

// Load env variables
dotenv.config();

// App init
const app = express();

// Connect to database
const initializeDB = async () => {
  try {
    await connectDB();
    console.log('Database connected successfully');
  } catch (err) {
    console.error('Database connection error:', err);
    process.exit(1);
  }
};

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'https://blood-flow.vercel.app',
    'https://blood-flow-server-v2.vercel.app',
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

app.use(express.json({ limit: '10kb' }));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Import and use routes AFTER middleware but BEFORE error handlers
import routes from './routes/index.js';
app.use('/api', routes);

// Root route
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head><title>BloodFlow API</title></head>
      <body>
        <h1>BloodFlow API</h1>
        <p>API is running</p>
      </body>
    </html>
  `);
});

// Error handlers (must be last)
app.use(notFound);
app.use(errorHandler);

// Start server
const startServer = async () => {
  await initializeDB();
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

// Start unless in test environment
if (process.env.NODE_ENV !== 'test') {
  startServer();
}

export default app;