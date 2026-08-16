// backend/src/modules/tasks/schemas/task.schema.ts

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Priority } from '../../../common/enums/priority.enum';
import { TaskStatus } from '../../../common/enums/task-status.enum';

export type TaskDocument = Task & Document;

@Schema({ timestamps: true })
export class Task {
  @Prop({
    required: true,
    trim: true,
  })
  title!: string;

  @Prop({
    default: '',
  })
  description!: string;

  @Prop({
    type: String,
    enum: TaskStatus,
    default: TaskStatus.TODO,
  })
  status!: TaskStatus;

  @Prop({
    type: String,
    enum: Priority,
    default: Priority.NONE,
  })
  priority!: Priority;

  @Prop()
  dueDate?: Date;

  @Prop({
    type: Types.ObjectId,
    ref: 'Project',
  })
  projectId?: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'Workspace',
    required: true,
    index: true,
  })
  workspaceId!: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    required: true,
  })
  reporterId!: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'Team',
  })
  teamId?: Types.ObjectId;

  // null = top-level task.
  // A Task ID = this task is a subtask.
  @Prop({
    type: Types.ObjectId,
    ref: 'Task',
    default: null,
  })
  parentTaskId?: Types.ObjectId | null;

  @Prop({
    type: [Types.ObjectId],
    ref: 'User',
    default: [],
  })
  memberIds!: Types.ObjectId[];

  @Prop({
    type: [Types.ObjectId],
    ref: 'Label',
    default: [],
  })
  labelIds!: Types.ObjectId[];

  // Used to order tasks within a status column.
  @Prop({
    default: 0,
  })
  order!: number;
}

export const TaskSchema = SchemaFactory.createForClass(Task);

// Board view:
// workspace → status → order
TaskSchema.index({
  workspaceId: 1,
  status: 1,
  order: 1,
});

// Project task lookup.
TaskSchema.index({
  projectId: 1,
});

// Subtask lookup.
TaskSchema.index({
  parentTaskId: 1,
});