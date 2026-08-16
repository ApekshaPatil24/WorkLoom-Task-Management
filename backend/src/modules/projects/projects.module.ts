import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import {
  Project,
  ProjectSchema,
} from './schemas/project.schema';

import {
  User,
  UserSchema,
} from '../users/schemas/user.schema';

import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Project.name,
        schema: ProjectSchema,
      },
      {
        name: User.name,
        schema: UserSchema,
      },
    ]),
  ],
  controllers: [ProjectsController],
  providers: [ProjectsService],

  // TasksModule imports ProjectsModule and injects ProjectModel,
  // so MongooseModule must remain exported.
  exports: [MongooseModule],
})
export class ProjectsModule {}