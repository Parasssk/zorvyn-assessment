import { IsEnum, IsBoolean, IsNotEmpty } from 'class-validator';
import { Role } from '../../../common/enums/role.enum';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateRoleDto {
  @ApiProperty({ enum: Role, example: Role.ANALYST })
  @IsEnum(Role)
  @IsNotEmpty()
  role: Role;
}

export class UpdateStatusDto {
  @ApiProperty({ example: true })
  @IsBoolean()
  @IsNotEmpty()
  isActive: boolean;
}
