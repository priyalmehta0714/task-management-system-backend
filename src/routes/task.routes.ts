import { Router } from 'express';
import { taskController } from '../controllers/task.controller';
import { authenticateUser, authorizeRoles } from '../middleware/auth.middleware';
import { validateRequest } from '../validations/user.validation';
import { taskSchemas } from '../validations/task.validation';
import { UserRole } from '../models/user.model';

const taskRouter = Router();

taskRouter.use(authenticateUser);

taskRouter.post(
  '/',
  authorizeRoles(UserRole.ADMIN),
  validateRequest(taskSchemas.createTask),
  taskController.createTask
);

taskRouter.get('/', taskController.getTasks);

taskRouter.put(
  '/:id',
  authorizeRoles(UserRole.ADMIN),
  validateRequest(taskSchemas.updateTask),
  taskController.updateTask
);

taskRouter.delete(
  '/:id',
  authorizeRoles(UserRole.ADMIN),
  taskController.deleteTask
);

taskRouter.patch(
  '/:id/status',
  authorizeRoles(UserRole.ADMIN || UserRole.USER),
  validateRequest(taskSchemas.updateTaskStatus),
  taskController.updateTaskStatus
);

taskRouter.get(
  '/statistics',
  authorizeRoles(UserRole.ADMIN),
  taskController.getTaskStatistics
);


taskRouter.get(
  '/users/:id/performance',
  authorizeRoles(UserRole.ADMIN),
  taskController.getUserPerformanceReport
);
taskRouter.get('/search', taskController.atlasSearch);


export default taskRouter;
