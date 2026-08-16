// backend/src/modules/labels/dto/create-label.dto.ts

import {
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';

export class CreateLabelDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  name!: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^#([0-9A-Fa-f]{6})$/, {
    message: 'color must be a valid hex color',
  })
  color!: string;
}