// backend/src/modules/teams/schemas/team.schema.ts

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TeamDocument = Team & Document;

@Schema({ timestamps: true })
export class Team {
  @Prop({
    required: true,
    trim: true,
  })
  name!: string;

  @Prop({
    type: Types.ObjectId,
    ref: 'Workspace',
    required: true,
    index: true,
  })
  workspaceId!: Types.ObjectId;

  @Prop({
    type: [Types.ObjectId],
    ref: 'User',
    default: [],
  })
  memberIds!: Types.ObjectId[];
}

export const TeamSchema = SchemaFactory.createForClass(Team);