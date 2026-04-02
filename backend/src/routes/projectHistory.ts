import { Router } from 'express';
import { ProjectHistoryController } from '../controllers/projectHistoryController.js';

const router = Router();
const controller = new ProjectHistoryController();

router.get('/', controller.getAll.bind(controller));
router.get('/project/:projectId', controller.getByProject.bind(controller));

export default router;
