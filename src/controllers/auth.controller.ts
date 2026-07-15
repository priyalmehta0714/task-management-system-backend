import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { userModel } from '../models/user.model';
import dotenv from 'dotenv';
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = '1d';

export const authController = {
  register: async (req: Request, res: Response): Promise<void> => {
    try {
      const { name, email, password, role } = req.body;

      // Check if user already exists in the database
      const existingUser = await userModel.findOne({ email });
      if (existingUser) {
        res.status(409).json({ status: 'error', message: 'Email is already registered' });
        return;
      }

      const newUser = new userModel({ name, email, password });
      await newUser.save();

      const userResponse = newUser.toObject();
      delete userResponse.password;

      res.status(201).json({
        status: 'success',
        message: 'User registered successfully',
        data: { user: userResponse },
      });
    } catch (error: any) {
      res.status(500).json({ status: 'error', message: 'Internal server error', error: error.message });
    }
  },

  // 2. User Login Logic
  login: async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password } = req.body;

      const user = await userModel.findOne({ email }).select('+password');
      if (!user) {
        res.status(401).json({ status: 'error', message: 'Invalid email or password' });
        return;
      }

      // Verify the password using our Mongoose schema method
      const isPasswordMatch = await user.comparePassword(password);
      if (!isPasswordMatch) {
        res.status(401).json({ status: 'error', message: 'Invalid email or password' });
        return;
      }

      // Generate JWT Token with userId and role payloads
      const token = jwt.sign(
        { userId: user._id, role: user.role },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      const userResponse = user.toObject();
      delete userResponse.password;

      res.status(200).json({
        status: 'success',
        message: 'Login successful',
        data: {
          token,
          user: userResponse,
        },
      });
    } catch (error: any) {
      res.status(500).json({ status: 'error', message: 'Internal server error', error: error.message });
    }
  },
};
