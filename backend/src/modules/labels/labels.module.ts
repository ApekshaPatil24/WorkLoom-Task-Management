// backend/src/modules/labels/labels.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Label, LabelSchema } from './schemas/label.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Label.name, schema: LabelSchema }])],
  exports: [MongooseModule],
})
export class LabelsModule {}