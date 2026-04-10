import { Router } from 'express';
import { MilestoneController } from '../controllers/milestoneController.js';

const router = Router();
const milestoneController = new MilestoneController();

router.get('/', milestoneController.getAllMilestones.bind(milestoneController));
router.get('/:id', milestoneController.getMilestoneById.bind(milestoneController));
router.get('/project/:projectId', milestoneController.getMilestonesByProject.bind(milestoneController));
router.post('/', milestoneController.createMilestone.bind(milestoneController));
router.put('/:id', milestoneController.updateMilestone.bind(milestoneController));
router.delete('/:id', milestoneController.deleteMilestone.bind(milestoneController));

export default router;
