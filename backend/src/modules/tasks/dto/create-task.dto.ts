// backend/src/modules/tasks/dto/create-task.dto.ts
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsMongoId,
  IsArray,
  IsDateString,
  IsInt,
  Min,
  MaxLength,
} from 'class-validator';
import { TaskStatus } from '../../../common/enums/task-status.enum';
import { Priority } from '../../../common/enums/priority.enum';

export class CreateTaskDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description?: string;

  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @IsOptional()
  @IsEnum(Priority)
  priority?: Priority;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsOptional()
  @IsMongoId()
  projectId?: string;

  @IsOptional()
  @IsMongoId()
  teamId?: string;

  @IsOptional()
  @IsMongoId()
  parentTaskId?: string;

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  memberIds?: string[];

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  labelIds?: string[];

  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;
}