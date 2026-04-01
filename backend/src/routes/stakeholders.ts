import { Router } from 'express';
import { StakeholderController } from '../controllers/stakeholderController.js';

const router = Router();
const stakeholderController = new StakeholderController();

router.get('/', stakeholderController.getAllStakeholders.bind(stakeholderController));
router.get('/:id', stakeholderController.getStakeholderById.bind(stakeholderController));
router.get('/project/:projectId', stakeholderController.getStakeholdersByProject.bind(stakeholderController));
router.post('/', stakeholderController.createStakeholder.bind(stakeholderController));
router.put('/:id', stakeholderController.updateStakeholder.bind(stakeholderController));
router.delete('/:id', stakeholderController.deleteStakeholder.bind(stakeholderController));

export default router;