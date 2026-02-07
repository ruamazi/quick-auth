import jwt from 'jsonwebtoken';
import type { AuthStrategy, User, LoginCredentials, AuthResult } from '../types';

export interface JWTStrategyConfig {
  secret: string;
  expiresIn?: string | number;
  issuer?: string;
  audience?: string;
}

export class JWTStrategy implements AuthStrategy {
  name = 'jwt';
  private config: JWTStrategyConfig;

  constructor(config: JWTStrategyConfig) {
    this.config = {
      expiresIn: '7d',
      ...config,
    };
  }

  async authenticate(credentials: LoginCredentials): Promise<AuthResult> {
    return {
      success: false,
      error: 'JWT strategy does not support direct authentication. Use login flow instead.',
    };
  }

  async verify(token: string): Promise<AuthResult> {
    try {
      const decoded = jwt.verify(token, this.config.secret, {
        issuer: this.config.issuer,
        audience: this.config.audience,
      }) as jwt.JwtPayload;

      if (!decoded.sub) {
        return { success: false, error: 'Invalid token payload' };
      }

      return {
        success: true,
        user: {
          id: decoded.sub,
          email: decoded.email as string,
          ...decoded,
        },
      };
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        return { success: false, error: 'Token expired' };
      }
      if (error instanceof jwt.JsonWebTokenError) {
        return { success: false, error: 'Invalid token' };
      }
      return { success: false, error: 'Token verification failed' };
    }
  }

  async generateToken(user: User): Promise<string> {
    const payload = {
      sub: user.id,
      email: user.email,
      ...Object.keys(user)
        .filter(key => !['id', 'password'].includes(key))
        .reduce((acc, key) => ({ ...acc, [key]: user[key] }), {}),
    };

    const options: jwt.SignOptions = {
      expiresIn: this.config.expiresIn as jwt.SignOptions['expiresIn'],
    };
    if (this.config.issuer) options.issuer = this.config.issuer;
    if (this.config.audience) options.audience = this.config.audience;

    return jwt.sign(payload, this.config.secret, options);
  }
}
