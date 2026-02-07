const express = require('express');
const { quickAuth } = require('../dist');
const { z } = require('zod');

const app = express();
app.use(express.json());

// Initialize quick auth with custom fields and validation
const auth = quickAuth({
  secret: 'my-super-secret-key-change-in-production',
  validation: {
    // Custom email validation
    email: z.string().email('Please enter a valid email address'),
    
    // Custom password validation (stronger requirements)
    password: z.string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    
    // Custom fields with validation
    fields: {
      name: z.string().min(2, 'Name must be at least 2 characters').optional(),
      age: z.number().min(13, 'You must be at least 13 years old').optional(),
      role: z.enum(['user', 'admin', 'moderator']).default('user'),
      bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
    },
    
    // Custom validation logic
    customValidator: (data) => {
      const errors = {};
      
      // Check if name contains only letters and spaces
      if (data.name && !/^[a-zA-Z\s]+$/.test(data.name)) {
        errors.name = 'Name can only contain letters and spaces';
      }
      
      // Check if bio contains inappropriate words (example)
      const inappropriateWords = ['spam', 'abuse'];
      if (data.bio) {
        const hasInappropriate = inappropriateWords.some(word => 
          data.bio.toLowerCase().includes(word)
        );
        if (hasInappropriate) {
          errors.bio = 'Bio contains inappropriate content';
        }
      }
      
      return {
        success: Object.keys(errors).length === 0,
        errors: Object.keys(errors).length > 0 ? errors : undefined
      };
    }
  }
});

// Apply auth middleware globally
app.use(auth.middleware());

// Public routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'Quick Auth with Custom Fields Example',
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

const PORT = process.env.PORT || 3002;

app.listen(PORT, () => {
  console.log('🚀 Server running on http://localhost:' + PORT);
  console.log('');
  console.log('This example includes:');
  console.log('  - Custom password validation (min 8 chars, uppercase, lowercase, number)');
  console.log('  - Custom fields: name, age, role, bio');
  console.log('  - Custom validator for name format and bio content');
  console.log('');
  console.log('Available endpoints:');
  console.log('  POST /auth/register - Register new user with custom fields');
  console.log('  POST /auth/login    - Login user');
  console.log('  POST /auth/logout   - Logout user (requires auth)');
  console.log('  GET  /auth/me       - Get current user (requires auth)');
  console.log('  GET  /api/protected - Protected endpoint (requires auth)');
  console.log('');
  console.log('Example registration with custom fields:');
  console.log("  curl -X POST http://localhost:" + PORT + "/auth/register \\");
  console.log("    -H 'Content-Type: application/json' \\");
  console.log('    -d \'{\"email\":\"john@example.com\",\"password\":\"SecurePass123\",\"name\":\"John Doe\",\"age\":25,\"role\":\"user\",\"bio\":\"Software developer\"}\'');
  console.log('');
  console.log('Example with validation errors:');
  console.log("  curl -X POST http://localhost:" + PORT + "/auth/register \\");
  console.log("    -H 'Content-Type: application/json' \\");
  console.log('    -d \'{\"email\":\"invalid-email\",\"password\":\"weak\",\"name\":\"J\",\"age\":10}\'');
});
