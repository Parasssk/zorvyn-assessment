import { Controller, Post, Get, Patch, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { CreateRecordUseCase } from './use-cases/create-record.usecase';
import { UpdateRecordUseCase } from './use-cases/update-record.usecase';
import { DeleteRecordUseCase } from './use-cases/delete-record.usecase';
import { GetRecordsUseCase } from './use-cases/get-records.usecase';
import { CreateRecordDto } from './dto/create-record.dto';
import { UpdateRecordDto } from './dto/update-record.dto';
import { GetRecordsDto } from './dto/get-records.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('Records')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('records')
export class RecordsController {
  constructor(
    private readonly createRecordUseCase: CreateRecordUseCase,
    private readonly updateRecordUseCase: UpdateRecordUseCase,
    private readonly deleteRecordUseCase: DeleteRecordUseCase,
    private readonly getRecordsUseCase: GetRecordsUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new financial record' })
  async create(@Request() req, @Body() dto: CreateRecordDto) {
    return this.createRecordUseCase.execute(req.user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get records (with pagination, filters, and search)' })
  async findAll(@Request() req, @Query() dto: GetRecordsDto) {
    return this.getRecordsUseCase.execute(req.user.id, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a financial record' })
  async update(@Request() req, @Param('id') id: string, @Body() dto: UpdateRecordDto) {
    return this.updateRecordUseCase.execute(id, req.user.id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete a financial record' })
  async remove(@Request() req, @Param('id') id: string) {
    return this.deleteRecordUseCase.execute(id, req.user.id);
  }
}
