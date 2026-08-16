import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import {
  Project,
  ProjectDocument,
} from './schemas/project.schema';
import {
  User,
  UserDocument,
} from '../users/schemas/user.schema';

import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

import type { JwtPayload } from '../../common/guards/jwt-auth.guard';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectModel(Project.name)
    private projectModel: Model<ProjectDocument>,

    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
  ) {}

  async create(dto: CreateProjectDto, user: JwtPayload) {
    const workspaceId = new Types.ObjectId(user.workspaceId);

    await this.validateLead(dto.leadId, workspaceId);

    return this.projectModel.create({
      ...dto,
      dueDate: dto.dueDate
        ? new Date(dto.dueDate)
        : undefined,
      workspaceId,
    });
  }

  async findAll(user: JwtPayload) {
    const workspaceId = new Types.ObjectId(user.workspaceId);

    const projects = await this.projectModel
      .find({ workspaceId })
      .sort({ createdAt: -1 })
      .exec();

    return {
      projects,
      total: projects.length,
    };
  }

  async findOne(id: string, user: JwtPayload) {
    this.assertValidObjectId(id);

    const project = await this.projectModel.findOne({
      _id: id,
      workspaceId: new Types.ObjectId(user.workspaceId),
    });

    // Same response whether the project doesn't exist or belongs
    // to another workspace, so we don't leak other workspace data.
    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return project;
  }

  async update(
    id: string,
    dto: UpdateProjectDto,
    user: JwtPayload,
  ) {
    const workspaceId = new Types.ObjectId(user.workspaceId);

    // Confirms that this project belongs to the current workspace.
    await this.findOne(id, user);

    if (dto.leadId) {
      await this.validateLead(dto.leadId, workspaceId);
    }

    const updatePayload: Record<string, unknown> = {
      ...dto,
    };

    if (dto.dueDate) {
      updatePayload.dueDate = new Date(dto.dueDate);
    }

    return this.projectModel.findOneAndUpdate(
      {
        _id: new Types.ObjectId(id),
        workspaceId,
      },
      updatePayload,
      {
        new: true,
        runValidators: true,
      },
    );
  }

  async remove(id: string, user: JwtPayload) {
    // Verifies both existence and workspace ownership.
    await this.findOne(id, user);

    await this.projectModel.deleteOne({
      _id: new Types.ObjectId(id),
      workspaceId: new Types.ObjectId(user.workspaceId),
    });

    return {
      success: true,
    };
  }

  private assertValidObjectId(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid project id');
    }
  }

  private async validateLead(
    leadId: string,
    workspaceId: Types.ObjectId,
  ) {
    if (!Types.ObjectId.isValid(leadId)) {
      throw new BadRequestException('Invalid leadId');
    }

    const exists = await this.userModel.exists({
      _id: leadId,
      workspaceId,
    });

    if (!exists) {
      throw new BadRequestException(
        'leadId does not belong to your workspace',
      );
    }
  }
}