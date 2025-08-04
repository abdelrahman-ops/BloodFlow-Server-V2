import app from './app.js';
import http from 'http';

const PORT = process.env.PORT || 5000;

// For Vercel deployment
if (process.env.VERCEL_ENV) {
  module.exports = app;
} else {
  // For local development
  const server = http.createServer(app);
  server.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on http://localhost:${PORT}`);
  });

  process.on('unhandledRejection', (err, promise) => {
    console.error(`Error: ${err.message}`);
    server.close(() => process.exit(1));
  });
}