import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserRole } from '../models/user.model';
import dotenv from 'dotenv';
dotenv.config()

const JWT_SECRET = process.env.JWT_SECRET;

interface CustomJwtPayload extends jwt.JwtPayload {
  userId: string;
  role: UserRole;
}

// Middleware to guard routes and verify logged-in users
export const authenticateUser = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ status: 'error', message: 'Access denied. No token provided.' });
      return;
    }

    // Extract the token payload string out of the Bearer schema wrapper
    const token = authHeader.split(' ')[1];

    // Decode and verify validity configurations
    const decoded = jwt.verify(token, JWT_SECRET) as CustomJwtPayload;

    // Attach minimal validation metrics directly onto the request layer scope
    req.user = {
      userId: decoded.userId,
      role: decoded.role,
    };

    next();
  } catch (error: any) {
    res.status(401).json({ status: 'error', message: 'Invalid or expired token.' });
  }
};

export const authorizeRoles = (...allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ status: 'error', message: 'Authentication required.' });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({ status: 'error', message: 'Forbidden. Insufficient permissions.' });
      return;
    }

    next();
  };
};
