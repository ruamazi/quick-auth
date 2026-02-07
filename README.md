# Quick Auth

Quick and easy authentication setup for Node.js applications.

[![GitHub](https://img.shields.io/badge/GitHub-ruamazi%2Fquick--auth-blue)](https://github.com/ruamazi/quick-auth)

## Installation

```bash
npm install @opencode/quick-auth
```

Or install from GitHub:

```bash
npm install github:ruamazi/quick-auth
```

## Quick Start

### Express.js Example

```javascript
const express = require('express');
const { quickAuth } = require('@opencode/quick-auth');

const app = express();
app.use(express.json());

// Initialize auth (uses in-memory adapter by default)
const auth = quickAuth({
  secret: 'your-secret-key-here',
});

// Apply middleware
app.use(auth.middleware());

// Auth routes
app.post('/auth/register', auth.register());
app.post('/auth/login', auth.login());
app.post('/auth/logout', auth.requireAuth(), auth.logout());
app.get('/auth/me', auth.requireAuth(), auth.me());

// Protected routes
app.get('/api/protected', auth.requireAuth(), (req, res) => {
  res.json({ message: 'Secret data', user: req.user });
});

app.listen(3000, () => console.log('Server running on port 3000'));
```

### Using the CLI

```bash
# Initialize with interactive setup
npx quick-auth init

# Generate a secret key
npx quick-auth generate-secret
```

## Features

- **Simple Setup**: One-line initialization with sensible defaults
- **JWT Authentication**: Secure JSON Web Token implementation
- **Multiple Adapters**: In-memory, Prisma, Mongoose support
- **Express Integration**: Ready-to-use middleware and route handlers
- **TypeScript Support**: Full type definitions included
- **Validation**: Built-in input validation with Zod
- **Security**: Bcrypt password hashing, secure token handling
- **Custom Fields**: Add any fields to user registration
- **Flexible Validation**: Customize validation rules for any field

## API Reference

### `quickAuth(options)`

Create authentication instance with minimal configuration.

```javascript
const auth = quickAuth({
  secret: 'your-secret',        // Required: JWT signing secret
  adapter: new MyAdapter(),     // Optional: Database adapter
  strategy: new MyStrategy(),   // Optional: Auth strategy
  expiresIn: '7d',              // Optional: Token expiration
  validation: {                 // Optional: Custom validation
    email: z.string().email(),
    password: z.string().min(8),
    fields: {
      name: z.string().min(2),
      age: z.number().min(13),
    }
  }
});
```

### `createAuth(config)`

Create authentication instance with full configuration.

```javascript
const auth = createAuth({
  adapter: new MemoryAdapter(),
  strategy: new JWTStrategy({ secret: 'your-secret' }),
  validation: {
    email: z.string().email(),
    password: z.string().min(8),
    fields: {
      name: z.string().optional(),
    }
  },
  callbacks: {
    onLogin: (user) => console.log('User logged in:', user.email),
    onRegister: (user) => console.log('User registered:', user.email),
  },
});
```

### Middleware

- `auth.middleware()` - Optional auth (attaches user if token present)
- `auth.requireAuth()` - Required auth (returns 401 if no valid token)

### Route Handlers

- `auth.register()` - POST handler for user registration
- `auth.login()` - POST handler for user login
- `auth.logout()` - POST handler for logout
- `auth.me()` - GET handler for current user info

## Custom Fields & Validation

You can add any custom fields to user registration with flexible validation:

```javascript
const { z } = require('zod');

const auth = quickAuth({
  secret: 'your-secret',
  validation: {
    // Custom email validation
    email: z.string().email('Please enter a valid email'),
    
    // Custom password validation (stronger requirements)
    password: z.string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must contain uppercase')
      .regex(/[0-9]/, 'Must contain number'),
    
    // Custom fields with validation
    fields: {
      name: z.string().min(2, 'Name too short').optional(),
      age: z.number().min(13, 'Must be 13+').optional(),
      role: z.enum(['user', 'admin']).default('user'),
      bio: z.string().max(500).optional(),
    },
    
    // Custom validation logic
    customValidator: (data) => {
      const errors = {};
      
      if (data.name && !/^[a-zA-Z\s]+$/.test(data.name)) {
        errors.name = 'Name can only contain letters';
      }
      
      return {
        success: Object.keys(errors).length === 0,
        errors: Object.keys(errors).length > 0 ? errors : undefined
      };
    }
  }
});
```

### Validation Error Responses

When validation fails, you'll get detailed error messages:

```json
{
  "success": false,
  "error": "Password must contain at least one number",
  "errors": {
    "email": "Please enter a valid email address",
    "password": "Password must contain at least one number",
    "name": "Name must be at least 2 characters",
    "age": "You must be at least 13 years old"
  }
}
```

## Database Adapters

### Memory Adapter (Development)

```javascript
const { MemoryAdapter } = require('@opencode/quick-auth');

const auth = quickAuth({
  secret: 'your-secret',
  adapter: new MemoryAdapter(),
});
```

### Custom Adapter

```javascript
class MyAdapter {
  async findUserByEmail(email) { /* ... */ }
  async findUserById(id) { /* ... */ }
  async createUser(data) { /* ... */ }
  async updateUser(id, data) { /* ... */ }
  async deleteUser(id) { /* ... */ }
}
```

## Environment Variables

```env
JWT_SECRET=your-secret-key
PORT=3000
```

## Examples

### Basic Example
See `examples/express-example.js` for a basic setup.

### Custom Fields Example
See `examples/custom-fields-example.js` for advanced validation and custom fields.

Run examples:
```bash
# Basic example
node examples/express-example.js

# Custom fields example
node examples/custom-fields-example.js
```

## 🤝 Contributing

We welcome contributions from everyone! This is an open source project and we appreciate your help in making it better.

### How to Contribute

#### Reporting Issues
- 🐛 **Bug reports**: Create an issue with clear steps to reproduce
- 💡 **Feature requests**: Describe the feature and its use case
- 📖 **Documentation**: Suggest improvements or corrections
- ❓ **Questions**: Open a discussion or issue

#### Development Setup

```bash
# Fork and clone the repository
git clone https://github.com/YOUR_USERNAME/quick-auth.git
cd quick-auth

# Install dependencies
npm install

# Build the project
npm run build

# Run tests
npm test

# Watch mode for development
npm run dev
```

#### Pull Request Process

1. **Fork** the repository
2. **Create a branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes** following our guidelines
4. **Build and test**: `npm run build`
5. **Commit**: `git commit -m 'Add: amazing feature'`
6. **Push**: `git push origin feature/amazing-feature`
7. **Open a Pull Request** with a clear description

### Code Guidelines

- Follow existing TypeScript patterns and style
- Add tests for new features
- Update documentation (README, examples)
- Keep the code focused and simple
- Ensure TypeScript compiles without errors

### Areas We Need Help With

- 🔌 **Database Adapters**: Prisma, Mongoose, Sequelize, TypeORM
- 🔐 **Auth Strategies**: OAuth (Google, GitHub, Discord, etc.), Magic Links
- 🚀 **Framework Support**: Fastify, Koa, Next.js API routes, NestJS
- 📊 **Analytics**: Login attempts, security monitoring
- 🧪 **Testing**: More comprehensive test coverage
- 📝 **Examples**: More real-world usage examples
- 🌍 **Documentation**: Translations, tutorials, blog posts

### Commit Message Format

We follow conventional commits:

```
feat: add new OAuth provider
docs: update README with examples
fix: resolve token expiration bug
refactor: simplify validation logic
test: add tests for custom fields
```

### Code of Conduct

This project follows the [Contributor Covenant](https://www.contributor-covenant.org/version/2/0/code_of_conduct/) Code of Conduct. By participating, you agree to uphold this code.

### Questions?

- Open an issue for questions or discussions
- Check existing issues before creating new ones
- Be respectful and constructive in all interactions

## 📄 License

MIT © [ruamazi](https://github.com/ruamazi)
