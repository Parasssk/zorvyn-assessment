import { IsOptional, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GetTrendsDto {
  @ApiProperty({ required: false, description: 'Start date in ISO 8601 format' })
  @IsOptional()
  @IsDateString()
  start?: string;

  @ApiProperty({ required: false, description: 'End date in ISO 8601 format' })
  @IsOptional()
  @IsDateString()
  end?: string;
}
