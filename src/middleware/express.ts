import type { Request, Response, NextFunction } from 'express';
import type { AuthEngine } from '../core/engine';
import type { MiddlewareOptions, User, RequestWithUser } from '../types';

export function createAuthMiddleware(auth: AuthEngine) {
  return {
    requireAuth: (options: MiddlewareOptions = {}) => {
      return async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
        try {
          const authHeader = req.headers.authorization;
          
          if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ 
              success: false, 
              error: 'Authentication required' 
            });
            return;
          }

          const token = authHeader.substring(7);
          const result = await auth.verifyToken(token);

          if (!result.success || !result.user) {
            res.status(401).json({ 
              success: false, 
              error: result.error || 'Invalid token' 
            });
            return;
          }

          req.user = result.user;
          next();
        } catch (error) {
          res.status(401).json({ 
            success: false, 
            error: 'Authentication failed' 
          });
        }
      };
    },

    optionalAuth: () => {
      return async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
        try {
          const authHeader = req.headers.authorization;
          
          if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            const result = await auth.verifyToken(token);
            
            if (result.success && result.user) {
              req.user = result.user;
            }
          }
          
          next();
        } catch (error) {
          next();
        }
      };
    },
  };
}
