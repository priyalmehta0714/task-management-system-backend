import { JwtPayload } from 'jsonwebtoken';
import { UserRole } from '../models/user.model';

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        role: UserRole;
      };
    }
  }
}
