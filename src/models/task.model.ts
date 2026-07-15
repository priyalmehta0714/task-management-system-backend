import { Schema, model, Document, Types } from 'mongoose';

export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in-progress',
  DONE = 'done'
}


export enum TaskPriority {
  HIGH = 1,
  MEDIUM = 2,
  LOW = 3
}

export interface ITask {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignedTo: Types.ObjectId;
  dueDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITaskDocument extends ITask, Document {
  _id: Types.ObjectId;
}

const TaskSchema = new Schema<ITaskDocument>(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: Object.values(TaskStatus),
      default: TaskStatus.TODO,
    },
    priority: {
      type: Number,
      enum: Object.values(TaskPriority).filter(v => typeof v === 'number'),
      default: TaskPriority.MEDIUM,
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'An assignee user reference ID is required'],
    },
    dueDate: {
      type: Date,
      required: [true, 'Due date is required'],
    },
  },
  {
    timestamps: true,
  }
);

TaskSchema.index({ title: 'text', description: 'text' });

export const TaskModel = model<ITaskDocument>('Task', TaskSchema);
