// backend/src/modules/tasks/tasks.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Task, TaskSchema } from './schemas/task.schema';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { ProjectsModule } from '../projects/projects.module';
import { TeamsModule } from '../teams/teams.module';
import { LabelsModule } from '../labels/labels.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Task.name, schema: TaskSchema }]),
    ProjectsModule, // for cross-workspace projectId validation
    TeamsModule,    // for teamId validation
    LabelsModule,   // for labelIds validation
    UsersModule,    // for memberIds validation
  ],
  controllers: [TasksController],
  providers: [TasksService],
  exports: [MongooseModule],
})
export class TasksModule {}