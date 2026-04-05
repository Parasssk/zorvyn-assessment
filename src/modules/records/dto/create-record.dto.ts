import { IsEnum, IsNumber, IsString, IsNotEmpty, IsDateString, IsOptional, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TransactionType } from '@prisma/client';

export class CreateRecordDto {
  @ApiProperty({ example: 100.5 })
  @IsNumber()
  @Min(0.01)
  @IsNotEmpty()
  amount: number;

  @ApiProperty({ enum: TransactionType, example: TransactionType.EXPENSE })
  @IsEnum(TransactionType)
  @IsNotEmpty()
  type: TransactionType;

  @ApiProperty({ example: 'Food' })
  @IsString()
  @IsNotEmpty()
  category: string;

  @ApiProperty({ example: '2023-10-01T00:00:00.000Z' })
  @IsDateString()
  @IsNotEmpty()
  date: string;

  @ApiPropertyOptional({ example: 'Lunch with team' })
  @IsString()
  @IsOptional()
  notes?: string;
}
