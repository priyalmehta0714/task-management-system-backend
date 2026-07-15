import { Request, Response } from 'express';
import { TaskModel, TaskStatus } from '../models/task.model';
import { userModel, UserRole } from '../models/user.model';
import { emitTaskEvent } from '../config/socket';
import mongoose from 'mongoose';

export const taskController = {
  createTask: async (req: Request, res: Response): Promise<void> => {
    try {
      const task = new TaskModel(req.body);
      await task.save();
      const populatedTask = await task.populate('assignedTo', 'name email role');
      
      emitTaskEvent('created', populatedTask);

      res.status(201).json({ status: 'success', data: task });
    } catch (error: any) {
      res.status(500).json({ status: 'error', message: error.message });
    }
  },

  getTasks: async (req: Request, res: Response): Promise<void> => {
    try {
      const { page = 1, limit = 10, search, status, priority } = req.query;
      const skip = (Number(page) - 1) * Number(limit);
      
      const filterQuery: any = {};

      if (req.user?.role !== UserRole.ADMIN) {
        filterQuery.assignedTo = req.user?.userId;
      }

      if (search) {
        filterQuery.$text = { $search: String(search) };
      }

      if (status) filterQuery.status = status;
      if (priority) filterQuery.priority = priority;

      const tasks = await TaskModel.find(filterQuery)
        .populate('assignedTo', 'name email role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit));

      const total = await TaskModel.countDocuments(filterQuery);

      res.status(200).json({
        status: 'success',
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          pages: Math.ceil(total / Number(limit)),
        },
        data: tasks,
      });
    } catch (error: any) {
      res.status(500).json({ status: 'error', message: error.message });
    }
  },


  updateTask: async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const updatedTask = await TaskModel.findByIdAndUpdate(
        id,
        { $set: req.body },
        { new: true, runValidators: true }
      );

      if (!updatedTask) {
        res.status(404).json({ status: 'error', message: 'Task record not found' });
        return;
      }
      emitTaskEvent('updated', updatedTask);
      res.status(200).json({ status: 'success', message: 'Task updated successfully', data: updatedTask });
    } catch (error: any) {
      res.status(500).json({ status: 'error', message: error.message });
    }
  },

 
  deleteTask: async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const deletedTask = await TaskModel.findByIdAndDelete(id);
      if (!deletedTask) {
        res.status(404).json({ status: 'error', message: 'Task record not found' });
        return;
      }
      
      emitTaskEvent('deleted', { _id: id });
      res.status(200).json({ status: 'success', message: 'Task deleted successfully' });
    } catch (error: any) {
      res.status(500).json({ status: 'error', message: error.message });
    }
  },

  
  updateTaskStatus: async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const task = await TaskModel.findById(id);
      if (!task) {
        res.status(404).json({ status: 'error', message: 'Task not found' });
        return;
      }

      if (req.user?.role !== UserRole.ADMIN && task.assignedTo.toString() !== req.user?.userId) {
        res.status(403).json({ status: 'error', message: 'Access denied. You can only update your own tasks.' });
        return;
      }

      task.status = status as TaskStatus;
      await task.save();
        const populatedTask = await task.populate('assignedTo', 'name email role');

      emitTaskEvent('status_updated', populatedTask);
      res.status(200).json({ status: 'success', message: 'Task status updated', data: task });
    } catch (error: any) {
      res.status(500).json({ status: 'error', message: error.message });
    }
  },

  getTaskStatistics: async (req: Request, res: Response): Promise<void> => {
    try {
      const today = new Date();
      const sevenDaysFromNow = new Date();
      sevenDaysFromNow.setDate(today.getDate() + 7);

      const stats = await TaskModel.aggregate([
        {
          $facet: {
            totalTasks: [{ $count: 'count' }],

            byStatus: [
              { $group: { _id: '$status', count: { $sum: 1 } } }
            ],

            byPriority: [
              { $group: { _id: '$priority', count: { $sum: 1 } } }
            ],
            dueSoon: [
              {
                $match: {
                  dueDate: {
                    $gte: today,
                    $lte: sevenDaysFromNow
                  }
                }
              },
              { $count: 'count' }
            ]
          }
        },
        {
          $project: {
            total: { $ifNull: [{ $arrayElemAt: ['$totalTasks.count', 0] }, 0] },
            statusBreakdown: '$byStatus',
            priorityBreakdown: '$byPriority',
            upcomingDeadlines7Days: { $ifNull: [{ $arrayElemAt: ['$dueSoon.count', 0] }, 0] }
          }
        }
      ]);

      res.status(200).json({
        status: 'success',
        data: stats[0]
      });
    } catch (error: any) {
      res.status(500).json({ status: 'error', message: error.message });
    }
  },

  getUserPerformanceReport: async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params; // Extract the targeted user ID from the path variable parameters

      const report = await userModel.aggregate([
        { $match: { _id: new mongoose.Types.ObjectId(id) } },

        {
          $lookup: {
            from: 'tasks',
            localField: '_id',
            foreignField: 'assignedTo',
            as: 'userTasks'
          }
        },

        {
          $project: {
            _id: 1,
            name: 1,
            email: 1,
            role: 1,
            totalTasksAssigned: { $size: '$userTasks' },
            
            tasksCompletedOnTime: {
              $size: {
                $filter: {
                  input: '$userTasks',
                  as: 'task',
                  cond: {
                    $and: [
                      { $eq: ['$$task.status', 'done'] },
                      { $lte: ['$$task.updatedAt', '$$task.dueDate'] }
                    ]
                  }
                }
              }
            }
          }
        },

        {
          $project: {
            _id: 1,
            name: 1,
            email: 1,
            role: 1,
            totalTasksAssigned: 1,
            onTimeCompletionPercentage: {
              $cond: {
                if: { $gt: ['$totalTasksAssigned', 0] },
                then: {
                  $round: [
                    { $multiply: [{ $divide: ['$tasksCompletedOnTime', '$totalTasksAssigned'] }, 100] },
                    2
                  ]
                },
                else: 0
              }
            }
          }
        }
      ]);

      if (!report || report.length === 0) {
        res.status(404).json({ status: 'error', message: 'User record target not found' });
        return;
      }
      res.status(200).json({
        status: 'success',
        data: report[0]
      });
    } catch (error: any) {
      res.status(500).json({ status: 'error', message: error.message });
    }
  },
  atlasSearch: async (req: Request, res: Response): Promise<void> => {
    try {
      const { q, page = 1, limit = 10 } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      if (!q) {
        res.status(400).json({ status: 'error', message: 'Query keyword parameter "q" is required' });
        return;
      }

      const searchRegex = new RegExp(String(q), 'i');

      const filterQuery: any = {
        $or: [
          { title: { $regex: searchRegex } },
          { description: { $regex: searchRegex } }
        ]
      };

      if (req.user?.role !== UserRole.ADMIN) {
        filterQuery.assignedTo = new mongoose.Types.ObjectId(req.user?.userId);
      }

      const tasks = await TaskModel.find(filterQuery)
        .populate('assignedTo', 'name email role')
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(Number(limit));

      const total = await TaskModel.countDocuments(filterQuery);

      res.status(200).json({
        status: 'success',
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          pages: Math.ceil(total / Number(limit))
        },
        data: tasks
      });
    } catch (error: any) {
      res.status(500).json({ status: 'error', message: error.message });
    }
  }



};
