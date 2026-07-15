import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { userSchemas, validateRequest } from '../validations/user.validation';

const authRouter = Router();


authRouter.post(
  '/register',
  validateRequest(userSchemas.register),
  authController.register
);

authRouter.post(
  '/login',
  validateRequest(userSchemas.login),
  authController.login
);

export default authRouter;
