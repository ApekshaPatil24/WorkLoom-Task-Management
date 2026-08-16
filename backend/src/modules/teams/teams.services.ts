// backend/src/modules/teams/teams.service.ts

import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import {
  Team,
  TeamDocument,
} from './schemas/team.schema';

import {
  User,
  UserDocument,
} from '../users/schemas/user.schema';

import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';

import type { JwtPayload } from '../../common/guards/jwt-auth.guard';

@Injectable()
export class TeamsService {
  constructor(
    @InjectModel(Team.name)
    private teamModel: Model<TeamDocument>,

    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
  ) {}

  async create(dto: CreateTeamDto, user: JwtPayload) {
    const workspaceId = new Types.ObjectId(user.workspaceId);

    const memberIds = dto.memberIds ?? [];

    await this.validateMembers(memberIds, workspaceId);

    return this.teamModel.create({
      name: dto.name,
      memberIds: memberIds.map(
        (id) => new Types.ObjectId(id),
      ),
      workspaceId,
    });
  }

  async findAll(user: JwtPayload) {
    const workspaceId = new Types.ObjectId(user.workspaceId);

    const teams = await this.teamModel
      .find({ workspaceId })
      .sort({ name: 1 })
      .exec();

    return {
      teams,
      total: teams.length,
    };
  }

  async findOne(id: string, user: JwtPayload) {
    this.assertValidObjectId(id);

    const team = await this.teamModel.findOne({
      _id: id,
      workspaceId: new Types.ObjectId(user.workspaceId),
    });

    if (!team) {
      throw new NotFoundException('Team not found');
    }

    return team;
  }

  async update(
    id: string,
    dto: UpdateTeamDto,
    user: JwtPayload,
  ) {
    this.assertValidObjectId(id);

    const workspaceId = new Types.ObjectId(user.workspaceId);

    await this.findOne(id, user);

    if (dto.memberIds !== undefined) {
      await this.validateMembers(
        dto.memberIds,
        workspaceId,
      );
    }

    const updatePayload: Record<string, unknown> = {
      ...dto,
    };

    if (dto.memberIds !== undefined) {
      updatePayload.memberIds = dto.memberIds.map(
        (memberId) => new Types.ObjectId(memberId),
      );
    }

    const updatedTeam =
      await this.teamModel.findOneAndUpdate(
        {
          _id: id,
          workspaceId,
        },
        updatePayload,
        {
          new: true,
          runValidators: true,
        },
      );

    if (!updatedTeam) {
      throw new NotFoundException('Team not found');
    }

    return updatedTeam;
  }

  async remove(id: string, user: JwtPayload) {
    this.assertValidObjectId(id);

    const workspaceId = new Types.ObjectId(user.workspaceId);

    const deletedTeam =
      await this.teamModel.findOneAndDelete({
        _id: id,
        workspaceId,
      });

    if (!deletedTeam) {
      throw new NotFoundException('Team not found');
    }

    return {
      success: true,
    };
  }

  private async validateMembers(
    memberIds: string[],
    workspaceId: Types.ObjectId,
  ) {
    if (!memberIds.length) {
      return;
    }

    const count = await this.userModel.countDocuments({
      _id: {
        $in: memberIds,
      },
      workspaceId,
    });

    if (count !== memberIds.length) {
      throw new BadRequestException(
        'One or more memberIds do not belong to your workspace',
      );
    }
  }

  private assertValidObjectId(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid team id');
    }
  }
}