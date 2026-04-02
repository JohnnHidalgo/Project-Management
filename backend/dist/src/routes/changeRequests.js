import { Router } from 'express';
import { ChangeRequestController } from '../controllers/changeRequestController.js';
const router = Router();
const changeRequestController = new ChangeRequestController();
// GET /api/changeRequests
router.get('/', (req, res) => changeRequestController.getAllChangeRequests(req, res));
// GET /api/changeRequests/:id
router.get('/:id', (req, res) => changeRequestController.getChangeRequestById(req, res));
// GET /api/changeRequests/task/:taskId
router.get('/task/:taskId', (req, res) => changeRequestController.getChangeRequestsByTask(req, res));
// POST /api/changeRequests
router.post('/', (req, res) => changeRequestController.createChangeRequest(req, res));
// PUT /api/changeRequests/:id
router.put('/:id', (req, res) => changeRequestController.updateChangeRequest(req, res));
// PUT /api/changeRequests/:id/process
router.put('/:id/process', (req, res) => changeRequestController.processChangeRequest(req, res));
// DELETE /api/changeRequests/:id
router.delete('/:id', (req, res) => changeRequestController.deleteChangeRequest(req, res));
export default router;
