import { Router } from 'express';
import { TaskLogController } from '../controllers/taskLogController.js';

const router = Router();
const taskLogController = new TaskLogController();

router.get('/', taskLogController.getAllTaskLogs.bind(taskLogController));
router.get('/:id', taskLogController.getTaskLogById.bind(taskLogController));
router.get('/task/:taskId', taskLogController.getTaskLogsByTask.bind(taskLogController));
router.post('/', taskLogController.createTaskLog.bind(taskLogController));
router.put('/:id', taskLogController.updateTaskLog.bind(taskLogController));
router.delete('/:id', taskLogController.deleteTaskLog.bind(taskLogController));

export default router;