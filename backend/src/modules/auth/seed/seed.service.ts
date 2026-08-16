// backend/src/modules/auth/seed/seed.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Project, ProjectDocument } from '../../projects/schemas/project.schema';
import { Task, TaskDocument } from '../../tasks/schemas/task.schema';
import { Label, LabelDocument } from '../../labels/schemas/label.schema';
import { Comment, CommentDocument } from '../../comments/schemas/comment.schema';
import { Resource, ResourceDocument } from '../../resources/schemas/resource.schema';
import { Priority } from '../../../common/enums/priority.enum';
import { TaskStatus } from '../../../common/enums/task-status.enum';
import { ResourceType } from '../../../common/enums/resource-type.enum';

@Injectable()
export class SeedService {
  constructor(
    @InjectModel(Project.name) private projectModel: Model<ProjectDocument>,
    @InjectModel(Task.name) private taskModel: Model<TaskDocument>,
    @InjectModel(Label.name) private labelModel: Model<LabelDocument>,
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
    @InjectModel(Resource.name) private resourceModel: Model<ResourceDocument>,
  ) {}

  // Called once, right after a guest Workspace + User are created.
  async seedWorkspace(workspaceId: Types.ObjectId, userId: Types.ObjectId) {
    const [bugLabel, featureLabel] = await this.labelModel.create([
      { name: 'Bug', color: '#EF4444', workspaceId },
      { name: 'Feature', color: '#3B82F6', workspaceId },
    ]);

    const project = await this.projectModel.create({
      name: 'Website Redesign',
      description: 'Refresh the marketing site with the new design system.',
      priority: Priority.HIGH,
      leadId: userId,
      dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // +21 days
      workspaceId,
    });

    const tasks = await this.taskModel.create([
      {
        title: 'Set up design tokens',
        description: 'Define color, spacing, and typography tokens in Tailwind config.',
        status: TaskStatus.COMPLETED,
        priority: Priority.HIGH,
        projectId: project._id,
        workspaceId,
        reporterId: userId,
        memberIds: [userId],
        labelIds: [featureLabel._id],
        order: 0,
      },
      {
        title: 'Build homepage hero section',
        description: 'Implement responsive hero with new imagery and CTA.',
        status: TaskStatus.DOING,
        priority: Priority.HIGH,
        projectId: project._id,
        workspaceId,
        reporterId: userId,
        memberIds: [userId],
        labelIds: [featureLabel._id],
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        order: 0,
      },
      {
        title: 'Fix broken nav on mobile',
        description: 'Nav menu does not close after tapping a link on mobile Safari.',
        status: TaskStatus.TODO,
        priority: Priority.URGENT,
        projectId: project._id,
        workspaceId,
        reporterId: userId,
        memberIds: [userId],
        labelIds: [bugLabel._id],
        order: 0,
      },
      {
        title: 'Write footer copy',
        description: 'Draft final footer content with marketing team.',
        status: TaskStatus.ON_HOLD,
        priority: Priority.LOW,
        projectId: project._id,
        workspaceId,
        reporterId: userId,
        memberIds: [userId],
        labelIds: [],
        order: 0,
      },
      {
        title: 'QA pass on staging',
        description: 'Full regression pass before launch.',
        status: TaskStatus.TODO,
        priority: Priority.MEDIUM,
        projectId: project._id,
        workspaceId,
        reporterId: userId,
        memberIds: [userId],
        labelIds: [],
        order: 1,
      },
    ]);

    // Subtask example — child of "Build homepage hero section".
    const heroTask = tasks[1];
    const subtask = await this.taskModel.create({
      title: 'Optimize hero image for mobile',
      status: TaskStatus.TODO,
      priority: Priority.MEDIUM,
      projectId: project._id,
      workspaceId,
      reporterId: userId,
      memberIds: [userId],
      parentTaskId: heroTask._id,
      order: 0,
    });

    // A comment + a resource, so opening a task detail screen isn't empty.
    await this.commentModel.create({
      taskId: heroTask._id,
      userId,
      content: 'Using the new hero image from the design team — link below.',
    });

    await this.resourceModel.create({
      taskId: heroTask._id,
      title: 'Figma — Homepage Hero',
      url: 'https://figma.com/file/example-hero-design',
      type: ResourceType.LINK,
    });

    return { project, taskCount: tasks.length + 1 };
  }
}