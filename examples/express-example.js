const express = require('express');
const { quickAuth } = require('../dist');

const app = express();
app.use(express.json());

// Initialize quick auth
const auth = quickAuth({
  secret: 'my-super-secret-key-change-in-production',
});

// Apply auth middleware globally
app.use(auth.middleware());

// Public routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'Quick Auth Example',
    authenticated: !!req.user,
    user: req.user || null
  });
});

// Auth routes
app.post('/auth/register', auth.register());
app.post('/auth/login', auth.login());
app.post('/auth/logout', auth.requireAuth(), auth.logout());
app.get('/auth/me', auth.requireAuth(), auth.me());

// Protected route
app.get('/api/protected', auth.requireAuth(), (req, res) => {
  res.json({
    message: 'This is a protected endpoint',
    timestamp: new Date().toISOString(),
    user: req.user
  });
});

// Admin-only route example
app.get('/api/admin', auth.requireAuth(), (req, res) => {
  // You can add role checking here
  res.json({
    message: 'Admin area',
    user: req.user
  });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log('🚀 Server running on http://localhost:' + PORT);
  console.log('');
  console.log('Available endpoints:');
  console.log('  POST /auth/register - Register new user');
  console.log('  POST /auth/login    - Login user');
  console.log('  POST /auth/logout   - Logout user (requires auth)');
  console.log('  GET  /auth/me       - Get current user (requires auth)');
  console.log('  GET  /api/protected - Protected endpoint (requires auth)');
  console.log('');
  console.log('Example usage:');
  console.log("  curl -X POST http://localhost:" + PORT + "/auth/register -H 'Content-Type: application/json' -d '{\"email\":\"test@example.com\",\"password\":\"password123\"}'");
});
