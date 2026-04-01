import { MilestoneService } from '../services/milestoneService.js';
export class MilestoneController {
    milestoneService;
    constructor() {
        this.milestoneService = new MilestoneService();
    }
    async getAllMilestones(req, res) {
        try {
            const milestones = await this.milestoneService.getAllMilestones();
            res.json(milestones);
        }
        catch (error) {
            res.status(500).json({ error: 'Failed to fetch milestones' });
        }
    }
    async getMilestoneById(req, res) {
        try {
            const { id } = req.params;
            const milestone = await this.milestoneService.getMilestoneById(id);
            res.json(milestone);
        }
        catch (error) {
            if (error instanceof Error && error.message === 'Milestone not found') {
                res.status(404).json({ error: error.message });
            }
            else {
                res.status(500).json({ error: 'Failed to fetch milestone' });
            }
        }
    }
    async getMilestonesByProject(req, res) {
        try {
            const { projectId } = req.params;
            const milestones = await this.milestoneService.getMilestonesByProject(projectId);
            res.json(milestones);
        }
        catch (error) {
            res.status(500).json({ error: 'Failed to fetch milestones by project' });
        }
    }
    async createMilestone(req, res) {
        try {
            const data = req.body;
            const milestone = await this.milestoneService.createMilestone(data);
            res.status(201).json(milestone);
        }
        catch (error) {
            if (error instanceof Error) {
                res.status(400).json({ error: error.message });
            }
            else {
                res.status(500).json({ error: 'Failed to create milestone' });
            }
        }
    }
    async updateMilestone(req, res) {
        try {
            const { id } = req.params;
            const data = req.body;
            const milestone = await this.milestoneService.updateMilestone(id, data);
            res.json(milestone);
        }
        catch (error) {
            if (error instanceof Error && error.message === 'Milestone not found') {
                res.status(404).json({ error: error.message });
            }
            else if (error instanceof Error) {
                res.status(400).json({ error: error.message });
            }
            else {
                res.status(500).json({ error: 'Failed to update milestone' });
            }
        }
    }
    async deleteMilestone(req, res) {
        try {
            const { id } = req.params;
            await this.milestoneService.deleteMilestone(id);
            res.status(204).send();
        }
        catch (error) {
            if (error instanceof Error && error.message === 'Milestone not found') {
                res.status(404).json({ error: error.message });
            }
            else {
                res.status(500).json({ error: 'Failed to delete milestone' });
            }
        }
    }
}
