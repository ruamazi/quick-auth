import { z } from 'zod';

export interface User {
  id: string;
  email: string;
  password?: string;
  [key: string]: any;
}

export interface AuthConfig {
  adapter: DatabaseAdapter;
  strategy: AuthStrategy;
  session?: SessionConfig;
  callbacks?: AuthCallbacks;
  validation?: ValidationConfig;
}

export interface ValidationConfig {
  email?: z.ZodString;
  password?: z.ZodString;
  fields?: Record<string, z.ZodTypeAny>;
  customValidator?: (data: any) => { success: boolean; errors?: Record<string, string> };
}

export interface SessionConfig {
  secret: string;
  expiresIn?: string | number;
}

export interface AuthCallbacks {
  onLogin?: (user: User) => void | Promise<void>;
  onRegister?: (user: User) => void | Promise<void>;
  onLogout?: (user: User) => void | Promise<void>;
}

export interface DatabaseAdapter {
  findUserByEmail(email: string): Promise<User | null>;
  findUserById(id: string): Promise<User | null>;
  createUser(data: CreateUserData): Promise<User>;
  updateUser(id: string, data: Partial<User>): Promise<User>;
  deleteUser(id: string): Promise<void>;
}

export interface CreateUserData {
  email: string;
  password: string;
  [key: string]: any;
}

export interface AuthStrategy {
  name: string;
  authenticate(credentials: LoginCredentials): Promise<AuthResult>;
  verify(token: string): Promise<AuthResult>;
  generateToken(user: User): Promise<string>;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResult {
  success: boolean;
  user?: User;
  token?: string;
  error?: string;
  errors?: Record<string, string>;
}

export interface MiddlewareOptions {
  requireAuth?: boolean;
  roles?: string[];
}

export interface RequestWithUser {
  user?: User;
  headers: {
    authorization?: string;
    [key: string]: any;
  };
  [key: string]: any;
}
