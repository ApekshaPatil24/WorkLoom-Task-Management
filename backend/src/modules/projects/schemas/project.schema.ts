// backend/src/modules/projects/schemas/project.schema.ts

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Priority } from '../../../common/enums/priority.enum';

export type ProjectDocument = Project & Document;

@Schema({ timestamps: true })
export class Project {
  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ default: '' })
  description!: string;

  @Prop({ type: String, enum: Priority, default: Priority.NONE })
  priority!: Priority;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  leadId!: Types.ObjectId;

  @Prop()
  dueDate?: Date;

  @Prop({
    type: Types.ObjectId,
    ref: 'Workspace',
    required: true,
    index: true,
  })
  workspaceId!: Types.ObjectId;
}

export const ProjectSchema = SchemaFactory.createForClass(Project);