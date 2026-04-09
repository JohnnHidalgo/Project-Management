import { StakeholderService } from '../services/stakeholderService.js';
export class StakeholderController {
    stakeholderService;
    constructor() {
        this.stakeholderService = new StakeholderService();
    }
    async getAllStakeholders(req, res) {
        try {
            const stakeholders = await this.stakeholderService.getAllStakeholders();
            res.json(stakeholders);
        }
        catch (error) {
            res.status(500).json({ error: 'Failed to fetch stakeholders' });
        }
    }
    async getStakeholderById(req, res) {
        try {
            const { id } = req.params;
            const stakeholder = await this.stakeholderService.getStakeholderById(id);
            res.json(stakeholder);
        }
        catch (error) {
            if (error instanceof Error && error.message === 'Stakeholder not found') {
                res.status(404).json({ error: error.message });
            }
            else {
                res.status(500).json({ error: 'Failed to fetch stakeholder' });
            }
        }
    }
    async getStakeholdersByProject(req, res) {
        try {
            const { projectId } = req.params;
            const stakeholders = await this.stakeholderService.getStakeholdersByProject(projectId);
            res.json(stakeholders);
        }
        catch (error) {
            res.status(500).json({ error: 'Failed to fetch stakeholders by project' });
        }
    }
    async createStakeholder(req, res) {
        try {
            const userRole = req.user?.role;
            // Sponsors cannot create stakeholders
            if (userRole === 'Sponsor') {
                return res.status(403).json({ error: 'Sponsors cannot create stakeholders' });
            }
            const data = req.body;
            const stakeholder = await this.stakeholderService.createStakeholder(data);
            res.status(201).json(stakeholder);
        }
        catch (error) {
            if (error instanceof Error) {
                res.status(400).json({ error: error.message });
            }
            else {
                res.status(500).json({ error: 'Failed to create stakeholder' });
            }
        }
    }
    async updateStakeholder(req, res) {
        try {
            const { id } = req.params;
            const data = req.body;
            const stakeholder = await this.stakeholderService.updateStakeholder(id, data);
            res.json(stakeholder);
        }
        catch (error) {
            if (error instanceof Error && error.message === 'Stakeholder not found') {
                res.status(404).json({ error: error.message });
            }
            else if (error instanceof Error) {
                res.status(400).json({ error: error.message });
            }
            else {
                res.status(500).json({ error: 'Failed to update stakeholder' });
            }
        }
    }
    async deleteStakeholder(req, res) {
        try {
            const { id } = req.params;
            await this.stakeholderService.deleteStakeholder(id);
            res.status(204).send();
        }
        catch (error) {
            if (error instanceof Error && error.message === 'Stakeholder not found') {
                res.status(404).json({ error: error.message });
            }
            else {
                res.status(500).json({ error: 'Failed to delete stakeholder' });
            }
        }
    }
}
