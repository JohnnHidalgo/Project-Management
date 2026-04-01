import { IssueService } from '../services/issueService.js';
export class IssueController {
    issueService;
    constructor() {
        this.issueService = new IssueService();
    }
    async getAllIssues(req, res) {
        try {
            const issues = await this.issueService.getAllIssues();
            res.json(issues);
        }
        catch (error) {
            res.status(500).json({ error: 'Failed to fetch issues' });
        }
    }
    async getIssueById(req, res) {
        try {
            const { id } = req.params;
            const issue = await this.issueService.getIssueById(id);
            res.json(issue);
        }
        catch (error) {
            if (error instanceof Error && error.message === 'Issue not found') {
                res.status(404).json({ error: error.message });
            }
            else {
                res.status(500).json({ error: 'Failed to fetch issue' });
            }
        }
    }
    async getIssuesByProject(req, res) {
        try {
            const { projectId } = req.params;
            const issues = await this.issueService.getIssuesByProject(projectId);
            res.json(issues);
        }
        catch (error) {
            res.status(500).json({ error: 'Failed to fetch issues by project' });
        }
    }
    async createIssue(req, res) {
        try {
            const data = req.body;
            const issue = await this.issueService.createIssue(data);
            res.status(201).json(issue);
        }
        catch (error) {
            if (error instanceof Error) {
                res.status(400).json({ error: error.message });
            }
            else {
                res.status(500).json({ error: 'Failed to create issue' });
            }
        }
    }
    async updateIssue(req, res) {
        try {
            const { id } = req.params;
            const data = req.body;
            const issue = await this.issueService.updateIssue(id, data);
            res.json(issue);
        }
        catch (error) {
            if (error instanceof Error && error.message === 'Issue not found') {
                res.status(404).json({ error: error.message });
            }
            else if (error instanceof Error) {
                res.status(400).json({ error: error.message });
            }
            else {
                res.status(500).json({ error: 'Failed to update issue' });
            }
        }
    }
    async deleteIssue(req, res) {
        try {
            const { id } = req.params;
            await this.issueService.deleteIssue(id);
            res.status(204).send();
        }
        catch (error) {
            if (error instanceof Error && error.message === 'Issue not found') {
                res.status(404).json({ error: error.message });
            }
            else {
                res.status(500).json({ error: 'Failed to delete issue' });
            }
        }
    }
}
