import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { UserService } from '../services/userService.js';

export class AuthController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      const user = await this.userService.authenticateUser(email, password);

      // Generate JWT token
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET || 'default-secret',
        { expiresIn: '24h' }
      );

      res.json({
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          department: user.department,
          position: user.position
        }
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'Invalid credentials') {
        res.status(401).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Login failed' });
      }
    }
  }

  async getProfile(req: Request, res: Response) {
    try {
      // User info should be attached by auth middleware
      const user = (req as any).user;
      if (!user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const userData = await this.userService.getUserById(user.id);
      res.json(userData);
    } catch (error) {
      res.status(500).json({ error: 'Failed to get profile' });
    }
  }
}