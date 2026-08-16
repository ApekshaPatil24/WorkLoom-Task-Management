// backend/src/modules/labels/labels.service.ts

import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import {
  Label,
  LabelDocument,
} from './schemas/label.schema';

import { CreateLabelDto } from './dto/create-label.dto';
import { UpdateLabelDto } from './dto/update-label.dto';

import type { JwtPayload } from '../../common/guards/jwt-auth.guard';

@Injectable()
export class LabelsService {
  constructor(
    @InjectModel(Label.name)
    private labelModel: Model<LabelDocument>,
  ) {}

  async create(dto: CreateLabelDto, user: JwtPayload) {
    const workspaceId = new Types.ObjectId(user.workspaceId);

    return this.labelModel.create({
      ...dto,
      workspaceId,
    });
  }

  async findAll(user: JwtPayload) {
    const workspaceId = new Types.ObjectId(user.workspaceId);

    const labels = await this.labelModel
      .find({ workspaceId })
      .sort({ name: 1 })
      .exec();

    return {
      labels,
      total: labels.length,
    };
  }

  async findOne(id: string, user: JwtPayload) {
    this.assertValidObjectId(id);

    const label = await this.labelModel.findOne({
      _id: id,
      workspaceId: new Types.ObjectId(user.workspaceId),
    });

    if (!label) {
      throw new NotFoundException('Label not found');
    }

    return label;
  }

  async update(
    id: string,
    dto: UpdateLabelDto,
    user: JwtPayload,
  ) {
    this.assertValidObjectId(id);

    const workspaceId = new Types.ObjectId(user.workspaceId);

    await this.findOne(id, user);

    const updatedLabel = await this.labelModel.findOneAndUpdate(
      {
        _id: id,
        workspaceId,
      },
      dto,
      {
        new: true,
        runValidators: true,
      },
    );

    if (!updatedLabel) {
      throw new NotFoundException('Label not found');
    }

    return updatedLabel;
  }

  async remove(id: string, user: JwtPayload) {
    this.assertValidObjectId(id);

    const workspaceId = new Types.ObjectId(user.workspaceId);

    const deletedLabel = await this.labelModel.findOneAndDelete({
      _id: id,
      workspaceId,
    });

    if (!deletedLabel) {
      throw new NotFoundException('Label not found');
    }

    return {
      success: true,
    };
  }

  private assertValidObjectId(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid label id');
    }
  }
}