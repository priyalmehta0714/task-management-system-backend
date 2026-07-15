import Joi from 'joi';
import { TaskStatus, TaskPriority } from '../models/task.model';

const validPriorityNumbers = Object.values(TaskPriority).filter(v => typeof v === 'number');

export const taskSchemas = {
  createTask: Joi.object({
    title: Joi.string().min(3).max(100).required(),
    description: Joi.string().max(500).allow('', null),
    status: Joi.string().valid(...Object.values(TaskStatus)).default(TaskStatus.TODO),
    priority: Joi.number().valid(...validPriorityNumbers).default(TaskPriority.MEDIUM).messages({
      'any.only': 'Priority must be 1 (High), 2 (Medium), or 3 (Low)'
    }),
    
    assignedTo: Joi.string().hex().length(24).required().messages({
      'string.length': 'assignedTo must be a valid 24-character hex MongoDB ObjectId'
    }),
    dueDate: Joi.date().iso().required(),
  }),

  updateTask: Joi.object({
    title: Joi.string().min(3).max(100).optional(),
    description: Joi.string().max(500).allow('', null).optional(),
    status: Joi.string().valid(...Object.values(TaskStatus)).optional(),
    priority: Joi.number().valid(1, 2, 3).optional(),
    assignedTo: Joi.string().hex().length(24).optional(),
    dueDate: Joi.date().iso().optional(),
  }),

  
  updateTaskStatus: Joi.object({
    status: Joi.string().valid(...Object.values(TaskStatus)).required(),
  }),


};
