import bcrypt from 'bcrypt';
import { z } from 'zod';
import type {
  AuthConfig,
  User,
  CreateUserData,
  LoginCredentials,
  AuthResult,
  DatabaseAdapter,
  AuthStrategy,
  ValidationConfig,
} from '../types';

const SALT_ROUNDS = 12;

const defaultLoginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

const defaultRegisterSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export class AuthEngine {
  private adapter: DatabaseAdapter;
  private strategy: AuthStrategy;
  private config: AuthConfig;
  private validationConfig: ValidationConfig;

  constructor(config: AuthConfig) {
    this.adapter = config.adapter;
    this.strategy = config.strategy;
    this.config = config;
    this.validationConfig = config.validation || {};
  }

  private buildRegisterSchema(): z.ZodObject<any> {
    const emailValidation = this.validationConfig.email || 
      z.string().email('Invalid email format');
    
    const passwordValidation = this.validationConfig.password || 
      z.string().min(6, 'Password must be at least 6 characters');

    let schema: any = {
      email: emailValidation,
      password: passwordValidation,
    };

    if (this.validationConfig.fields) {
      Object.entries(this.validationConfig.fields).forEach(([field, validator]) => {
        schema[field] = validator;
      });
    }

    return z.object(schema).passthrough();
  }

  private formatZodError(error: z.ZodError): Record<string, string> {
    const errors: Record<string, string> = {};
    error.errors.forEach((err) => {
      const path = err.path.join('.');
      if (path) {
        errors[path] = err.message;
      }
    });
    return errors;
  }

  async register(data: CreateUserData): Promise<AuthResult> {
    try {
      // Run custom validator if provided
      if (this.validationConfig.customValidator) {
        const customResult = this.validationConfig.customValidator(data);
        if (!customResult.success) {
          return {
            success: false,
            error: 'Validation failed',
            errors: customResult.errors,
          };
        }
      }

      const schema = this.buildRegisterSchema();
      const validated = schema.parse(data);
      
      // Check if user exists
      const existingUser = await this.adapter.findUserByEmail(validated.email);
      if (existingUser) {
        return { 
          success: false, 
          error: 'User already exists',
          errors: { email: 'This email is already registered' }
        };
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(validated.password, SALT_ROUNDS);
      
      // Prepare user data (exclude password from custom fields, hash it separately)
      const { password, ...customFields } = validated;
      
      const user = await this.adapter.createUser({
        email: validated.email,
        password: hashedPassword,
        ...customFields,
      });

      if (this.config.callbacks?.onRegister) {
        await this.config.callbacks.onRegister(user);
      }

      const token = await this.strategy.generateToken(user);

      return {
        success: true,
        user: this.sanitizeUser(user),
        token,
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = this.formatZodError(error);
        const firstError = Object.values(errors)[0] || 'Validation failed';
        return { 
          success: false, 
          error: firstError,
          errors 
        };
      }
      return { 
        success: false, 
        error: 'Registration failed: ' + (error as Error).message 
      };
    }
  }

  async login(credentials: LoginCredentials): Promise<AuthResult> {
    try {
      const validated = defaultLoginSchema.parse(credentials);
      
      const user = await this.adapter.findUserByEmail(validated.email);
      if (!user || !user.password) {
        return { 
          success: false, 
          error: 'Invalid credentials',
          errors: { general: 'Invalid email or password' }
        };
      }

      const isValid = await bcrypt.compare(validated.password, user.password);
      if (!isValid) {
        return { 
          success: false, 
          error: 'Invalid credentials',
          errors: { general: 'Invalid email or password' }
        };
      }

      if (this.config.callbacks?.onLogin) {
        await this.config.callbacks.onLogin(user);
      }

      const token = await this.strategy.generateToken(user);

      return {
        success: true,
        user: this.sanitizeUser(user),
        token,
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = this.formatZodError(error);
        const firstError = Object.values(errors)[0] || 'Validation failed';
        return { 
          success: false, 
          error: firstError,
          errors 
        };
      }
      return { 
        success: false, 
        error: 'Login failed: ' + (error as Error).message 
      };
    }
  }

  async verifyToken(token: string): Promise<AuthResult> {
    return this.strategy.verify(token);
  }

  async getUser(id: string): Promise<User | null> {
    const user = await this.adapter.findUserById(id);
    return user ? this.sanitizeUser(user) : null;
  }

  async updateUser(id: string, data: Partial<User>): Promise<User> {
    const user = await this.adapter.updateUser(id, data);
    return this.sanitizeUser(user);
  }

  async deleteUser(id: string): Promise<void> {
    await this.adapter.deleteUser(id);
  }

  async logout(user: User): Promise<void> {
    if (this.config.callbacks?.onLogout) {
      await this.config.callbacks.onLogout(user);
    }
  }

  private sanitizeUser(user: User): User {
    const { password, ...sanitized } = user;
    return sanitized as User;
  }
}
