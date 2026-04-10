import { UserRepository } from '../repositories/userRepository.js';
import { Prisma } from '@prisma/client';
import bcrypt from 'bcrypt';

export class UserService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async getAllUsers() {
    return await this.userRepository.findAll();
  }

  async getUserById(id: string) {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  async createUser(data: Prisma.UserCreateInput) {
    // Business logic validation
    if (!data.name || data.name.trim().length === 0) {
      throw new Error('User name is required');
    }
    if (!data.email || data.email.trim().length === 0) {
      throw new Error('User email is required');
    }
    if (!data.password || data.password.trim().length === 0) {
      throw new Error('User password is required');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    const payload = {
      ...data,
      password: hashedPassword,
      id: (data as any).id || `u${Date.now()}`,
    };

    return await this.userRepository.create(payload);
  }

  async updateUser(id: string, data: Prisma.UserUpdateInput) {
    // Validate the user exists
    await this.getUserById(id);

    // Hash password if provided
    if (data.password) {
      data.password = await bcrypt.hash(data.password as string, 10);
    }

    return await this.userRepository.update(id, data);
  }

  async deleteUser(id: string) {
    // Validate the user exists
    await this.getUserById(id);

    return await this.userRepository.delete(id);
  }

  async authenticateUser(email: string, password: string) {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}
