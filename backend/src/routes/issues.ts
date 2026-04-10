import { Router } from 'express';
import { IssueController } from '../controllers/issueController.js';

const router = Router();
const issueController = new IssueController();

router.get('/', issueController.getAllIssues.bind(issueController));
router.get('/:id', issueController.getIssueById.bind(issueController));
router.get('/project/:projectId', issueController.getIssuesByProject.bind(issueController));
router.post('/', issueController.createIssue.bind(issueController));
router.put('/:id', issueController.updateIssue.bind(issueController));
router.delete('/:id', issueController.deleteIssue.bind(issueController));

export default router;
