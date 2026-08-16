// backend/src/modules/auth/auth.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { User, UserDocument } from '../users/schemas/user.schema';
import { Workspace, WorkspaceDocument } from '../workspaces/schemas/workspace.schema';
import { SeedService } from './seed/seed.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Workspace.name) private workspaceModel: Model<WorkspaceDocument>,
    private jwtService: JwtService,
    private configService: ConfigService,
    private seedService: SeedService,
  ) {}

  async createGuestSession() {
    const workspace = await this.workspaceModel.create({
      name: 'My Workspace',
    });

    const guestSuffix = Math.random().toString(36).slice(2, 8);

    const user = await this.userModel.create({
      name: 'Guest User',
      username: `guest_${guestSuffix}`,
      isGuest: true,
      workspaceId: workspace._id,
    });

    await this.seedService.seedWorkspace(workspace._id, user._id);

    const token = this.jwtService.sign(
      { sub: user._id.toString(), workspaceId: workspace._id.toString() },
      {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: (this.configService.get<string>('JWT_EXPIRES_IN') ??
          '7d') as JwtSignOptions['expiresIn'],
      },
    );

    return { token, user, workspace };
  }

  async getCurrentUser(userId: string) {
    return this.userModel.findById(userId);
  }
}