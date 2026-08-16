// backend/src/modules/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { JwtModule, JwtSignOptions } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SeedService } from './seed/seed.service';
import { UsersModule } from '../users/users.module';
import { WorkspacesModule } from '../workspaces/workspaces.module';
import { ProjectsModule } from '../projects/projects.module';
import { TasksModule } from '../tasks/tasks.module';
import { LabelsModule } from '../labels/labels.module';
import { CommentsModule } from '../comments/comments.module';
import { ResourcesModule } from '../resources/resources.module';

@Module({
  imports: [
    UsersModule,
    WorkspacesModule,
    ProjectsModule,
    TasksModule,
    LabelsModule,
    CommentsModule,
    ResourcesModule,

    JwtModule.registerAsync({
      global: true,
      imports: [ConfigModule],
      inject: [ConfigService],

      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: {
            expiresIn: (config.get<string>('JWT_EXPIRES_IN') ?? '7d') as JwtSignOptions['expiresIn'],
        },
    }),

    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, SeedService],
})
export class AuthModule {}