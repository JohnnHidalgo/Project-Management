import { UserRepository } from '../repositories/userRepository.js';
export class UserService {
    userRepository;
    constructor() {
        this.userRepository = new UserRepository();
    }
    async getAllUsers() {
        return await this.userRepository.findAll();
    }
    async getUserById(id) {
        const user = await this.userRepository.findById(id);
        if (!user) {
            throw new Error('User not found');
        }
        return user;
    }
    async createUser(data) {
        // Business logic validation
        if (!data.name || data.name.trim().length === 0) {
            throw new Error('User name is required');
        }
        const payload = {
            ...data,
            id: data.id || `u${Date.now()}`,
        };
        return await this.userRepository.create(payload);
    }
    async updateUser(id, data) {
        // Validate the user exists
        await this.getUserById(id);
        return await this.userRepository.update(id, data);
    }
    async deleteUser(id) {
        // Validate the user exists
        await this.getUserById(id);
        return await this.userRepository.delete(id);
    }
}
