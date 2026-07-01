import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Extend Express Request interface to include the user payload
export interface AuthRequest extends Request {
  user?: any;
}

export const verifyToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    res.status(401).json({ error: 'Access denied. No token provided.' });
    return;
  }

  const token = authHeader.split(' ')[1]; // Expected format: "Bearer <token>"
  if (!token) {
    res.status(401).json({ error: 'Access denied. Invalid token format.' });
    return;
  }

  try {
    const secret = process.env.JWT_SECRET || 'fallback_secret';
    const decoded: any = jwt.verify(token, secret);
    
    // Normalize user ID to support both old and new token formats
    if (decoded.id && !decoded.userId) decoded.userId = decoded.id;
    if (decoded.userId && !decoded.id) decoded.id = decoded.userId;
    
    req.user = decoded;
    next();
  } catch (error) {
    res.status(403).json({ error: 'Invalid token.' });
  }
};

export const isAdmin = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ error: 'Access denied. Requires admin role.' });
  }
};

export const authorizeRoles = (...allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (req.user && allowedRoles.includes(req.user.role)) {
      next();
    } else {
      res.status(403).json({ error: `Access denied. Requires one of: ${allowedRoles.join(', ')}` });
    }
  };
};

export const isNotEmployee = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (req.user && req.user.role !== 'employee') {
    next();
  } else {
    res.status(403).json({ error: 'Access denied. Employees cannot perform this action.' });
  }
};
