// backend/src/modules/users/schemas/user.schema.ts

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({
    required: true,
    trim: true,
  })
  name!: string;

  // Optional because guest users don't necessarily have an email.
  @Prop({
    trim: true,
    lowercase: true,
  })
  email?: string;

  @Prop({
    required: true,
    trim: true,
  })
  username!: string;

  @Prop({
    default: '',
  })
  title!: string;

  @Prop({
    default: '',
  })
  avatar!: string;

  @Prop({
    default: false,
  })
  isGuest!: boolean;

  @Prop({
    type: Types.ObjectId,
    ref: 'Workspace',
    required: true,
    index: true,
  })
  workspaceId!: Types.ObjectId;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Allows the same email only once within a workspace.
// Sparse means documents without an email are not included.
UserSchema.index(
  { workspaceId: 1, email: 1 },
  {
    unique: true,
    sparse: true,
  },
);