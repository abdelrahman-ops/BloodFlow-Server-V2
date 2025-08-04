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
    <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>BloodFlow API</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    line-height: 1.6;
                    margin: 0;
                    padding: 20px;
                    background-color: #f5f5f5;
                    color: #333;
                }
                .container {
                    max-width: 800px;
                    margin: 0 auto;
                    background: white;
                    padding: 30px;
                    border-radius: 8px;
                    box-shadow: 0 0 10px rgba(0,0,0,0.1);
                }
                h1 {
                    color: #e74c3c;
                    border-bottom: 2px solid #e74c3c;
                    padding-bottom: 10px;
                }
                .status {
                    display: inline-block;
                    padding: 5px 10px;
                    background: #2ecc71;
                    color: white;
                    border-radius: 4px;
                    font-weight: bold;
                }
                .endpoints {
                    margin-top: 20px;
                }
                .endpoint {
                    background: #f9f9f9;
                    padding: 15px;
                    margin-bottom: 10px;
                    border-left: 4px solid #e74c3c;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>BloodFlow API</h1>
                <p>Welcome to the BloodFlow API service. This API powers the BloodFlow blood donation platform.</p>
                
                <h2>API Status: <span class="status">Operational</span></h2>
                
                <div class="endpoints">
                    <h3>Available Endpoints:</h3>
                    <div class="endpoint">
                        <strong>GET /api/donors</strong> - List all blood donors
                    </div>
                    <div class="endpoint">
                        <strong>POST /api/auth</strong> - User authentication
                    </div>
                    <div class="endpoint">
                        <strong>GET /api/blood-requests</strong> - List blood requests
                    </div>
                    <!-- Add more endpoints as needed -->
                </div>
                
                <p>For documentation and usage instructions, please refer to our <a href="https://github.com/abdelrahman-ops/BloodFlow-Server-V2" target="_blank">API documentation</a>.</p>
                
                <footer>
                    <p>&copy; ${new Date().getFullYear()} BloodFlow. All rights reserved.</p>
                </footer>
            </div>
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
