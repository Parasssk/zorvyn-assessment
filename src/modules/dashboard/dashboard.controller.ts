import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { GetSummaryUseCase } from './use-cases/get-summary.usecase';
import { GetCategoryBreakdownUseCase } from './use-cases/get-category-breakdown.usecase';
import { GetTrendsUseCase } from './use-cases/get-trends.usecase';

@ApiTags('Dashboard')
@ApiBearerAuth()
@Controller('dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DashboardController {
  constructor(
    private readonly getSummaryUseCase: GetSummaryUseCase,
    private readonly getCategoryBreakdownUseCase: GetCategoryBreakdownUseCase,
    private readonly getTrendsUseCase: GetTrendsUseCase,
  ) {}

  @Get('summary')
  @Roles(Role.ADMIN, Role.ANALYST, Role.VIEWER)
  @ApiOperation({ summary: 'Get total income, expense, and net balance' })
  async getSummary(@Req() req: any) {
    return this.getSummaryUseCase.execute(req.user.sub || req.user.id);
  }

  @Get('category')
  @Roles(Role.ADMIN, Role.ANALYST, Role.VIEWER)
  @ApiOperation({ summary: 'Get total spending grouped by category' })
  async getCategoryBreakdown(@Req() req: any) {
    return this.getCategoryBreakdownUseCase.execute(req.user.sub || req.user.id);
  }

  @Get('trends')
  @Roles(Role.ADMIN, Role.ANALYST) // Enforcing structural RBAC logic directly! Viewers cannot access advanced anomalies data. 
  @ApiOperation({ summary: 'Get spending trends and anomaly detection' })
  async getTrends(@Req() req: any) {
    return this.getTrendsUseCase.execute(req.user.sub || req.user.id);
  }
}
