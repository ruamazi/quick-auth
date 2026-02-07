import { AuthEngine } from './core/engine';
import { JWTStrategy } from './strategies/jwt';
import { MemoryAdapter } from './adapters/memory';
import { createAuthMiddleware } from './middleware/express';
import type { AuthConfig, DatabaseAdapter, AuthStrategy, ValidationConfig } from './types';

export * from './types';
export { AuthEngine } from './core/engine';
export { JWTStrategy } from './strategies/jwt';
export { MemoryAdapter } from './adapters/memory';
export { createAuthMiddleware } from './middleware/express';

export interface QuickAuthOptions {
  secret: string;
  adapter?: DatabaseAdapter;
  strategy?: AuthStrategy;
  expiresIn?: string | number;
  validation?: ValidationConfig;
}

export function quickAuth(options: QuickAuthOptions) {
  const adapter = options.adapter || new MemoryAdapter();
  const strategyConfig: any = { secret: options.secret };
  if (options.expiresIn !== undefined) {
    strategyConfig.expiresIn = options.expiresIn;
  }
  const strategy = options.strategy || new JWTStrategy(strategyConfig);

  const engine = new AuthEngine({
    adapter,
    strategy,
    validation: options.validation,
  });

  const middleware = createAuthMiddleware(engine);

  return {
    engine,
    middleware: () => middleware.optionalAuth(),
    requireAuth: () => middleware.requireAuth(),
    login: () => async (req: any, res: any) => {
      const result = await engine.login(req.body);
      res.status(result.success ? 200 : 401).json(result);
    },
    register: () => async (req: any, res: any) => {
      const result = await engine.register(req.body);
      res.status(result.success ? 201 : 400).json(result);
    },
    logout: () => async (req: any, res: any) => {
      if (req.user) {
        await engine.logout(req.user);
      }
      res.json({ success: true });
    },
    me: () => async (req: any, res: any) => {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Not authenticated' });
      }
      res.json({ success: true, user: req.user });
    },
  };
}

export function createAuth(config: AuthConfig) {
  const engine = new AuthEngine(config);
  const middleware = createAuthMiddleware(engine);

  return {
    engine,
    middleware: () => middleware.optionalAuth(),
    requireAuth: () => middleware.requireAuth(),
    login: () => async (req: any, res: any) => {
      const result = await engine.login(req.body);
      res.status(result.success ? 200 : 401).json(result);
    },
    register: () => async (req: any, res: any) => {
      const result = await engine.register(req.body);
      res.status(result.success ? 201 : 400).json(result);
    },
    logout: () => async (req: any, res: any) => {
      if (req.user) {
        await engine.logout(req.user);
      }
      res.json({ success: true });
    },
    me: () => async (req: any, res: any) => {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Not authenticated' });
      }
      res.json({ success: true, user: req.user });
    },
  };
}
