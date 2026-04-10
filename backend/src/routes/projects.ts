import { Router } from 'express';
import { ProjectController } from '../controllers/projectController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();
const projectController = new ProjectController();

// Apply authentication to all routes
router.use(authenticateToken);

router.get('/', projectController.getAllProjects.bind(projectController));
router.get('/:id', projectController.getProjectById.bind(projectController));
router.post('/', projectController.createProject.bind(projectController));
router.put('/:id', projectController.updateProject.bind(projectController));
router.put('/:id/toggle-edit', projectController.togglePmCanEdit.bind(projectController));
router.delete('/:id', projectController.deleteProject.bind(projectController));

export default router;
