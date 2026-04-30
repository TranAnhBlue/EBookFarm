// Simple health check endpoint for Vercel
export default function handler(req, res) {
  res.status(200).json({ 
    success: true, 
    message: 'EBook Farm API is running',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV
  });
}
