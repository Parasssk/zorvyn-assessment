import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  UseGuards,
  Query,
  ParseIntPipe,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery, ApiParam, ApiBody, ApiResponse } from '@nestjs/swagger';
import { UpdateRoleDto, UpdateStatusDto } from './dto/update-user.dto';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get all users (Admin only)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Returns paginated user list' })
  @ApiResponse({ status: 403, description: 'Forbidden (Requires ADMIN role)' })
  async findAll(
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 10,
  ) {
    return this.usersService.findAll(page, limit);
  }

  @Get(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get user by id (Admin only)' })
  @ApiParam({ name: 'id', description: 'UUID of the user' })
  @ApiResponse({ status: 200, description: 'User retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden (Requires ADMIN role)' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id/role')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update user role (Admin only)' })
  @ApiParam({ name: 'id', description: 'UUID of the user target' })
  @ApiBody({ type: UpdateRoleDto })
  @ApiResponse({ status: 200, description: 'Role securely updated' })
  @ApiResponse({ status: 400, description: 'Bad Request (Self-demotion prevention or invalid enum)' })
  @ApiResponse({ status: 403, description: 'Forbidden (Requires ADMIN role)' })
  async updateRole(
    @Param('id') id: string,
    @Body() updateRoleDto: UpdateRoleDto,
    @Req() req: any,
  ) {
    if (req.user.sub === id || req.user.id === id) {
      throw new BadRequestException('You cannot modify your own role.');
    }
    return this.usersService.updateRole(id, updateRoleDto.role);
  }

  @Patch(':id/status')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update user status (Admin only)' })
  @ApiParam({ name: 'id', description: 'UUID of the user target' })
  @ApiBody({ type: UpdateStatusDto })
  @ApiResponse({ status: 200, description: 'Status securely updated' })
  @ApiResponse({ status: 400, description: 'Bad Request (Self-deactivation prevention)' })
  @ApiResponse({ status: 403, description: 'Forbidden (Requires ADMIN role)' })
  async updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateStatusDto,
    @Req() req: any,
  ) {
    if (req.user.sub === id || req.user.id === id) {
      throw new BadRequestException('You cannot modify your own status.');
    }
    return this.usersService.updateStatus(id, updateStatusDto.isActive);
  }
}
