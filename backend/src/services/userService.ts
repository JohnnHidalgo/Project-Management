import { UserRepository } from '../repositories/userRepository.js';
import { Prisma } from '../../.prisma/client';

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

    const payload = {
      ...data,
      id: (data as any).id || `u${Date.now()}`,
    };

    return await this.userRepository.create(payload);
  }

  async updateUser(id: string, data: Prisma.UserUpdateInput) {
    // Validate the user exists
    await this.getUserById(id);

    return await this.userRepository.update(id, data);
  }

  async deleteUser(id: string) {
    // Validate the user exists
    await this.getUserById(id);

    return await this.userRepository.delete(id);
  }
}