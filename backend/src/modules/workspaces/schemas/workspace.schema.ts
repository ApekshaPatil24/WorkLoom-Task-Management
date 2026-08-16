// backend/src/modules/workspaces/schemas/workspace.schema.ts

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type WorkspaceDocument = Workspace & Document;

@Schema({ timestamps: true })
export class Workspace {
  @Prop({
    required: true,
    trim: true,
    default: 'My Workspace',
  })
  name!: string;
}

export const WorkspaceSchema = SchemaFactory.createForClass(Workspace);