#!/usr/bin/env node

import { Command } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import fs from 'fs/promises';
import path from 'path';

const program = new Command();

program
  .name('quick-auth')
  .description('CLI for quick-auth - Easy authentication setup')
  .version('1.0.0');

program
  .command('init')
  .description('Initialize quick-auth in your project')
  .option('-d, --dir <directory>', 'Project directory', '.')
  .action(async (options) => {
    console.log(chalk.blue.bold('🚀 Quick Auth Setup\n'));

    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'framework',
        message: 'Which framework are you using?',
        choices: [
          { name: 'Express.js', value: 'express' },
          { name: 'Fastify', value: 'fastify' },
          { name: 'Next.js (API Routes)', value: 'nextjs' },
        ],
      },
      {
        type: 'list',
        name: 'database',
        message: 'Which database adapter?',
        choices: [
          { name: 'In-Memory (for testing/development)', value: 'memory' },
          { name: 'Prisma (recommended)', value: 'prisma' },
          { name: 'Mongoose (MongoDB)', value: 'mongoose' },
        ],
      },
      {
        type: 'list',
        name: 'strategy',
        message: 'Which authentication strategy?',
        choices: [
          { name: 'JWT (JSON Web Tokens)', value: 'jwt' },
          { name: 'Session-based', value: 'session' },
        ],
      },
      {
        type: 'input',
        name: 'secret',
        message: 'Enter JWT/Session secret (or press enter to generate):',
        default: generateSecret(),
      },
    ]);

    const template = generateTemplate(answers);
    
    const fileName = answers.framework === 'nextjs' 
      ? 'auth.ts' 
      : 'auth.js';
    
    const filePath = path.join(options.dir, fileName);
    
    await fs.writeFile(filePath, template);
    
    console.log(chalk.green(`\n✅ Created ${fileName}`));
    console.log(chalk.yellow('\nNext steps:'));
    console.log(chalk.white('1. Install dependencies: npm install @opencode/quick-auth'));
    console.log(chalk.white('2. Import and use auth in your app'));
    console.log(chalk.white(`3. Check ${fileName} for setup example\n`));
  });

program
  .command('generate-secret')
  .description('Generate a random secret key')
  .action(() => {
    console.log(chalk.green('Generated secret:'));
    console.log(chalk.yellow(generateSecret()));
  });

function generateSecret(): string {
  return Array.from({ length: 32 }, () => 
    Math.random().toString(36).charAt(2)
  ).join('');
}

function generateTemplate(config: any): string {
  const isTypeScript = config.framework === 'nextjs';
  const ext = isTypeScript ? 'ts' : 'js';
  
  const imports = config.framework === 'express' 
    ? `const express = require('express');
const { quickAuth } = require('@opencode/quick-auth');`
    : config.framework === 'fastify'
    ? `const fastify = require('fastify')();
const { quickAuth } = require('@opencode/quick-auth');`
    : `import { quickAuth } from '@opencode/quick-auth';`;

  const adapterImport = config.database === 'prisma'
    ? `const { PrismaAdapter } = require('@opencode/quick-auth/adapters/prisma');`
    : config.database === 'mongoose'
    ? `const { MongooseAdapter } = require('@opencode/quick-auth/adapters/mongoose');`
    : '';

  return `${imports}
${adapterImport}

// Initialize authentication
const auth = quickAuth({
  secret: '${config.secret}',
  ${config.database !== 'memory' ? `adapter: new ${config.database === 'prisma' ? 'PrismaAdapter' : 'MongooseAdapter'}(),` : ''}
});

// For Express
const app = express();
app.use(express.json());

// Apply auth middleware
app.use(auth.middleware());

// Auth routes
app.post('/auth/register', auth.register());
app.post('/auth/login', auth.login());
app.post('/auth/logout', auth.requireAuth(), auth.logout());
app.get('/auth/me', auth.requireAuth(), auth.me());

// Protected route example
app.get('/api/protected', auth.requireAuth(), (req, res) => {
  res.json({ message: 'This is protected', user: req.user });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('Server running on port ' + PORT);
});
`;
}

program.parse();
