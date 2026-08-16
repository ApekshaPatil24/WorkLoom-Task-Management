// backend/src/modules/resources/schemas/resource.schema.ts

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ResourceType } from '../../../common/enums/resource-type.enum';

export type ResourceDocument = Resource & Document;

@Schema({ timestamps: true })
export class Resource {
  @Prop({
    type: Types.ObjectId,
    ref: 'Task',
    required: true,
    index: true,
  })
  taskId!: Types.ObjectId;

  @Prop({
    required: true,
    trim: true,
  })
  title!: string;

  @Prop({
    required: true,
    trim: true,
  })
  url!: string;

  @Prop({
    type: String,
    enum: ResourceType,
    default: ResourceType.LINK,
  })
  type!: ResourceType;
}

export const ResourceSchema = SchemaFactory.createForClass(Resource);