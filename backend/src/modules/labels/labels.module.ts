// backend/src/modules/labels/labels.module.ts

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Label, LabelSchema } from './schemas/label.schema';
import { LabelsController } from './labels.controller';
import { LabelsService } from './labels.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Label.name,
        schema: LabelSchema,
      },
    ]),
  ],
  controllers: [LabelsController],
  providers: [LabelsService],
  exports: [MongooseModule],
})
export class LabelsModule {}