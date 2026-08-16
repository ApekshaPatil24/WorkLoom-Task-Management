// backend/src/modules/tasks/dto/find-tasks-query.dto.ts
import { IsOptional, IsEnum, IsMongoId, IsString, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { TaskStatus } from '../../../common/enums/task-status.enum';
import { Priority } from '../../../common/enums/priority.enum';

export class FindTasksQueryDto {
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @IsOptional()
  @IsEnum(Priority)
  priority?: Priority;

  @IsOptional()
  @IsMongoId()
  projectId?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsMongoId()
  assigneeId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 50;
}