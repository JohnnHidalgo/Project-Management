import express from 'express';
import { ProjectSnapshotController } from '../controllers/projectSnapshotController.js';

const router = express.Router();
const controller = new ProjectSnapshotController();

router.get('/', controller.getAllSnapshots.bind(controller));
router.get('/:id', controller.getSnapshotById.bind(controller));
router.get('/project/:projectId', controller.getSnapshotsByProject.bind(controller));
router.post('/', controller.createSnapshot.bind(controller));

export default router;
