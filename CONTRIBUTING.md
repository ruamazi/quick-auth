# Contributing to Quick Auth

Thank you for your interest in contributing to Quick Auth! This document provides detailed guidelines for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Workflow](#development-workflow)
- [Style Guidelines](#style-guidelines)
- [Commit Messages](#commit-messages)
- [Pull Request Process](#pull-request-process)

## Code of Conduct

This project adheres to the [Contributor Covenant Code of Conduct](https://www.contributor-covenant.org/version/2/0/code_of_conduct/). By participating, you are expected to uphold this code.

### Our Standards

- Be respectful and inclusive
- Accept constructive criticism gracefully
- Focus on what's best for the community
- Show empathy towards others

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm or yarn
- Git

### Setup

```bash
# Fork the repository on GitHub
# Clone your fork
git clone https://github.com/YOUR_USERNAME/quick-auth.git
cd quick-auth

# Install dependencies
npm install

# Build the project
npm run build

# Run tests
npm test

# Start development mode
npm run dev
```

## How Can I Contribute?

### Reporting Bugs

Before creating a bug report:

1. Check if the issue already exists
2. Try the latest version to see if it's fixed
3. Collect information about the bug

When creating a bug report, include:

- **Clear title** describing the issue
- **Steps to reproduce** the bug
- **Expected behavior** vs actual behavior
- **Environment**: Node.js version, OS, package version
- **Code samples** or error messages
- **Screenshots** if applicable

### Suggesting Features

Feature requests are welcome! Please:

- Use a clear, descriptive title
- Provide a detailed description of the feature
- Explain why this feature would be useful
- Consider how it fits with the project's philosophy (simple, fast auth)
- Include examples of how it would be used

### Contributing Code

#### Types of Contributions

- **Bug fixes**: Fix issues in existing functionality
- **New features**: Add new auth strategies or database adapters
- **Documentation**: Improve README, add examples, write tutorials
- **Tests**: Increase test coverage
- **Performance**: Optimize existing code

#### Priority Areas

We especially welcome contributions for:

1. **Database Adapters**
   - Prisma adapter
   - Mongoose/MongoDB adapter
   - Sequelize adapter
   - TypeORM adapter
   - Raw SQL adapters (PostgreSQL, MySQL, SQLite)

2. **Authentication Strategies**
   - OAuth providers (Google, GitHub, Discord, Twitter)
   - Magic Link authentication
   - Session-based authentication
   - Refresh token support

3. **Framework Support**
   - Fastify plugin
   - Next.js API routes helpers
   - Koa middleware
   - NestJS module

4. **Security Enhancements**
   - Rate limiting
   - Account lockout
   - Two-factor authentication (2FA)
   - Password strength meter

## Development Workflow

### Creating a Branch

```bash
# Create and switch to a new branch
git checkout -b feature/your-feature-name

# Or for bug fixes
git checkout -b fix/issue-description
```

### Making Changes

1. **Write code** following our style guidelines
2. **Add tests** for new functionality
3. **Update documentation** (README, code comments)
4. **Run tests** and ensure they pass: `npm test`
5. **Build** the project: `npm run build`

### Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Building

```bash
# Compile TypeScript
npm run build

# Watch mode for development
npm run dev
```

## Style Guidelines

### TypeScript

- Use TypeScript for all new code
- Enable strict mode
- Use explicit types (avoid `any` when possible)
- Export types for public APIs

Example:

```typescript
// Good
export interface UserConfig {
  adapter: DatabaseAdapter;
  secret: string;
}

// Avoid
export function init(config: any) { ... }
```

### Code Structure

```
src/
├── adapters/          # Database adapters
│   └── memory.ts
├── core/             # Core logic
│   └── engine.ts
├── middleware/       # Framework middleware
│   └── express.ts
├── strategies/       # Auth strategies
│   └── jwt.ts
└── types/           # Type definitions
    └── index.ts
```

### Naming Conventions

- **Files**: kebab-case (`jwt-strategy.ts`)
- **Classes**: PascalCase (`JWTStrategy`)
- **Interfaces**: PascalCase with `I` prefix (optional) (`IUserConfig`)
- **Functions**: camelCase (`validateUser`)
- **Constants**: UPPER_SNAKE_CASE for true constants

### Error Handling

```typescript
// Good - provide detailed error messages
try {
  await validateUser(data);
} catch (error) {
  return {
    success: false,
    error: 'Validation failed: ' + error.message,
    errors: error.errors
  };
}
```

## Commit Messages

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, no logic changes)
- **refactor**: Code refactoring
- **test**: Adding or updating tests
- **chore**: Build process, dependencies, etc.

### Examples

```
feat(adapter): add Prisma database adapter

Implement a Prisma adapter that supports:
- User CRUD operations
- Custom field mapping
- Type-safe queries

fix(strategy): resolve JWT token expiration bug

docs(readme): add custom validation example

refactor(core): simplify error handling logic

test(adapter): add tests for memory adapter
```

## Pull Request Process

### Before Submitting

1. **Sync with main**: `git pull origin main`
2. **Run tests**: Ensure all tests pass
3. **Build**: Make sure TypeScript compiles
4. **Lint**: Fix any linting errors
5. **Documentation**: Update if needed

### Submitting

1. **Push to your fork**:
   ```bash
   git push origin feature/your-feature
   ```

2. **Create Pull Request** on GitHub

3. **Fill out the template**:
   - Clear title and description
   - Reference any related issues
   - List changes made
   - Include screenshots if UI changes

4. **Wait for review**:
   - Maintainers will review your PR
   - Address any requested changes
   - Keep the PR updated with main

### PR Requirements

- All tests must pass
- Code must be properly typed
- Documentation must be updated
- No breaking changes (or clearly documented)
- PR should be focused on a single feature/fix

## Questions?

- **GitHub Issues**: For bugs and feature requests
- **GitHub Discussions**: For questions and ideas
- **Email**: If you need to reach maintainers privately

## Recognition

Contributors will be:

- Listed in the README (for significant contributions)
- Mentioned in release notes
- Added to the contributors list

Thank you for contributing to Quick Auth! 🚀
