import { UserService } from '../services/userService.js';
export class UserController {
    userService;
    constructor() {
        this.userService = new UserService();
    }
    async getAllUsers(req, res) {
        try {
            const users = await this.userService.getAllUsers();
            res.json(users);
        }
        catch (error) {
            res.status(500).json({ error: 'Failed to fetch users' });
        }
    }
    async getUserById(req, res) {
        try {
            const { id } = req.params;
            const user = await this.userService.getUserById(id);
            res.json(user);
        }
        catch (error) {
            if (error instanceof Error && error.message === 'User not found') {
                res.status(404).json({ error: error.message });
            }
            else {
                res.status(500).json({ error: 'Failed to fetch user' });
            }
        }
    }
    async createUser(req, res) {
        try {
            const data = req.body;
            const user = await this.userService.createUser(data);
            res.status(201).json(user);
        }
        catch (error) {
            if (error instanceof Error) {
                res.status(400).json({ error: error.message });
            }
            else {
                res.status(500).json({ error: 'Failed to create user' });
            }
        }
    }
    async updateUser(req, res) {
        try {
            const { id } = req.params;
            const data = req.body;
            const user = await this.userService.updateUser(id, data);
            res.json(user);
        }
        catch (error) {
            if (error instanceof Error && error.message === 'User not found') {
                res.status(404).json({ error: error.message });
            }
            else if (error instanceof Error) {
                res.status(400).json({ error: error.message });
            }
            else {
                res.status(500).json({ error: 'Failed to update user' });
            }
        }
    }
    async deleteUser(req, res) {
        try {
            const { id } = req.params;
            await this.userService.deleteUser(id);
            res.status(204).send();
        }
        catch (error) {
            if (error instanceof Error && error.message === 'User not found') {
                res.status(404).json({ error: error.message });
            }
            else {
                res.status(500).json({ error: 'Failed to delete user' });
            }
        }
    }
}
