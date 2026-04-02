import { ProjectHistoryService } from '../services/projectHistoryService.js';
export class ProjectHistoryController {
    projectHistoryService;
    constructor() {
        this.projectHistoryService = new ProjectHistoryService();
    }
    async getAll(req, res) {
        try {
            const history = await this.projectHistoryService.getAllProjectHistories();
            res.json(history);
        }
        catch (error) {
            res.status(500).json({ error: 'Failed to fetch project history' });
        }
    }
    async getByProject(req, res) {
        try {
            const { projectId } = req.params;
            const history = await this.projectHistoryService.getProjectHistoryByProject(projectId);
            res.json(history);
        }
        catch (error) {
            res.status(500).json({ error: 'Failed to fetch project history by project' });
        }
    }
}
