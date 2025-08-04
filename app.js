import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import connectDB from './config/db.js';
import { errorHandler, notFound } from './middlewares/error.js';
import path from 'path';
import { fileURLToPath } from 'url';

// Route files
import routes from './routes/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Connect to database
await connectDB();

// Middleware
app.use(
    cors({
        origin: [
            "http://localhost:5173",
            "http://localhost:5174",
            "https://blood-flow.vercel.app",
            "https://blood-flow-server-v2.vercel.app"
        ],
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: true,
    })
);
app.options('*', cors());
app.use(express.json());

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Add this before your routes
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

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// Root route - Show API information
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
                
                <p>For documentation and usage instructions, please refer to our <a href="https://github.com/your-repo/docs" target="_blank">API documentation</a>.</p>
                
                <footer>
                    <p>&copy; ${new Date().getFullYear()} BloodFlow. All rights reserved.</p>
                </footer>
            </div>
        </body>
        </html>
    `);
});

// Mount routers
app.use('/api', routes);
