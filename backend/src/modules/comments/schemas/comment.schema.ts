// backend/src/modules/comments/schemas/comment.schema.ts

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CommentDocument = Comment & Document;

@Schema({ timestamps: true })
export class Comment {
  @Prop({
    type: Types.ObjectId,
    ref: 'Task',
    required: true,
    index: true,
  })
  taskId!: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    required: true,
  })
  userId!: Types.ObjectId;

  @Prop({
    required: true,
    trim: true,
  })
  content!: string;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);

// Loading a task's comment thread in chronological order.
CommentSchema.index({ taskId: 1, createdAt: 1 });