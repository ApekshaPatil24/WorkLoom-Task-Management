// backend/src/modules/tasks/tasks.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Task, TaskDocument } from './schemas/task.schema';
import { Project, ProjectDocument } from '../projects/schemas/project.schema';
import { Team, TeamDocument } from '../teams/schemas/team.schema';
import { Label, LabelDocument } from '../labels/schemas/label.schema';
import { User, UserDocument } from '../users/schemas/user.schema';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { FindTasksQueryDto } from './dto/find-tasks-query.dto';
import type { JwtPayload } from '../../common/guards/jwt-auth.guard';

@Injectable()
export class TasksService {
  constructor(
    @InjectModel(Task.name) private taskModel: Model<TaskDocument>,
    @InjectModel(Project.name) private projectModel: Model<ProjectDocument>,
    @InjectModel(Team.name) private teamModel: Model<TeamDocument>,
    @InjectModel(Label.name) private labelModel: Model<LabelDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async create(dto: CreateTaskDto, user: JwtPayload) {
    const workspaceId = new Types.ObjectId(user.workspaceId);
    await this.validateReferences(dto, workspaceId);

    return this.taskModel.create({
      ...dto,
      dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
      workspaceId,
      reporterId: new Types.ObjectId(user.sub),
    });
  }

  async findAll(query: FindTasksQueryDto, user: JwtPayload) {
    const workspaceId = new Types.ObjectId(user.workspaceId);

    // parentTaskId: null → board/list views only ever see top-level tasks.
    // Subtasks are fetched separately via findSubtasks(), never mixed in here.
    const filter: Record<string, unknown> = { workspaceId, parentTaskId: null };

    if (query.status) filter.status = query.status;
    if (query.priority) filter.priority = query.priority;
    if (query.projectId) filter.projectId = new Types.ObjectId(query.projectId);
    if (query.assigneeId) filter.memberIds = new Types.ObjectId(query.assigneeId);
    if (query.search) filter.title = { $regex: query.search, $options: 'i' };

    const page = query.page ?? 1;
    const limit = query.limit ?? 50;

    const [tasks, total] = await Promise.all([
      this.taskModel
        .find(filter)
        .sort({ order: 1, createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .exec(),
      this.taskModel.countDocuments(filter),
    ]);

    return { tasks, total, page, limit };
  }

  async findOne(id: string, user: JwtPayload) {
    this.assertValidObjectId(id);
    const task = await this.taskModel.findOne({
      _id: id,
      workspaceId: new Types.ObjectId(user.workspaceId),
    });
    // Same 404 whether the id doesn't exist OR belongs to another workspace —
    // never reveal which one, to avoid leaking existence of other guests' data.
    if (!task) throw new NotFoundException('Task not found');
    return task;
  }

  async findSubtasks(id: string, user: JwtPayload) {
    await this.findOne(id, user); // confirms parent exists & belongs to this workspace
    return this.taskModel.find({
      parentTaskId: new Types.ObjectId(id),
      workspaceId: new Types.ObjectId(user.workspaceId),
    });
  }

  async update(id: string, dto: UpdateTaskDto, user: JwtPayload) {
    const workspaceId = new Types.ObjectId(user.workspaceId);
    await this.findOne(id, user); // 404s if missing or wrong workspace
    await this.validateReferences(dto, workspaceId);

    const updatePayload: Record<string, unknown> = { ...dto };
    if (dto.dueDate) updatePayload.dueDate = new Date(dto.dueDate);

    return this.taskModel.findByIdAndUpdate(id, updatePayload, { new: true });
  }

  async remove(id: string, user: JwtPayload) {
    await this.findOne(id, user);
    // Deleting a parent shouldn't silently delete its subtasks or leave them
    // pointing at a dead id — detach them back to top-level tasks instead.
    await this.taskModel.updateMany({ parentTaskId: id }, { parentTaskId: null });
    await this.taskModel.findByIdAndDelete(id);
    return { success: true };
  }

  private assertValidObjectId(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid task id');
    }
  }

  // Guards against a guest referencing another workspace's project/team/
  // labels/members — either by tampering or by a stale frontend id.
  private async validateReferences(
    dto: CreateTaskDto | UpdateTaskDto,
    workspaceId: Types.ObjectId,
  ) {
    if (dto.projectId) {
      const exists = await this.projectModel.exists({ _id: dto.projectId, workspaceId });
      if (!exists) throw new BadRequestException('projectId does not belong to your workspace');
    }

    if (dto.teamId) {
      const exists = await this.teamModel.exists({ _id: dto.teamId, workspaceId });
      if (!exists) throw new BadRequestException('teamId does not belong to your workspace');
    }

    if (dto.parentTaskId) {
      const exists = await this.taskModel.exists({ _id: dto.parentTaskId, workspaceId });
      if (!exists) throw new BadRequestException('parentTaskId does not belong to your workspace');
    }

    if (dto.labelIds?.length) {
      const count = await this.labelModel.countDocuments({
        _id: { $in: dto.labelIds },
        workspaceId,
      });
      if (count !== dto.labelIds.length) {
        throw new BadRequestException('One or more labelIds are invalid for your workspace');
      }
    }

    if (dto.memberIds?.length) {
      const count = await this.userModel.countDocuments({
        _id: { $in: dto.memberIds },
        workspaceId,
      });
      if (count !== dto.memberIds.length) {
        throw new BadRequestException('One or more memberIds are invalid for your workspace');
      }
    }
  }
}