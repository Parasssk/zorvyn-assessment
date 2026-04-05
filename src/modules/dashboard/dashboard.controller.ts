import { Controller, Get, UseGuards, Req, Query, UseInterceptors, Logger } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { GetSummaryUseCase } from './use-cases/get-summary.usecase';
import { GetCategoryBreakdownUseCase } from './use-cases/get-category-breakdown.usecase';
import { GetTrendsUseCase } from './use-cases/get-trends.usecase';
import { GetTrendsDto } from './dto/get-trends.dto';
import { CacheTTL } from '@nestjs/cache-manager';
import { UserCacheInterceptor } from '../../common/interceptors/user-cache.interceptor';

@ApiTags('Dashboard')
@ApiBearerAuth()
@Controller('dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DashboardController {
  private readonly logger = new Logger(DashboardController.name);

  constructor(
    private readonly getSummaryUseCase: GetSummaryUseCase,
    private readonly getCategoryBreakdownUseCase: GetCategoryBreakdownUseCase,
    private readonly getTrendsUseCase: GetTrendsUseCase,
  ) {}

  @Get('summary')
  @Roles(Role.ADMIN, Role.ANALYST, Role.VIEWER)
  @ApiOperation({ summary: 'Get total income, expense, and net balance' })
  @ApiResponse({ status: 200, description: 'Financial summary strictly bound to the user' })
  @UseInterceptors(UserCacheInterceptor)
  @CacheTTL(60)
  async getSummary(@Req() req: any) {
    const userId = req.user.sub || req.user.id;
    this.logger.log(`User ${userId} fetched summary`);
    return this.getSummaryUseCase.execute(userId);
  }

  @Get('category')
  @Roles(Role.ADMIN, Role.ANALYST, Role.VIEWER)
  @ApiOperation({ summary: 'Get total spending grouped by category' })
  @ApiResponse({ status: 200, description: 'Categorized array sorted by heavy spending dynamically' })
  @UseInterceptors(UserCacheInterceptor)
  @CacheTTL(60)
  async getCategoryBreakdown(@Req() req: any) {
    return this.getCategoryBreakdownUseCase.execute(req.user.sub || req.user.id);
  }

  @Get('trends')
  @Roles(Role.ADMIN, Role.ANALYST) // Enforcing structural RBAC logic directly! Viewers cannot access advanced anomalies data. 
  @ApiOperation({ summary: 'Get spending trends and anomaly detection' })
  @ApiQuery({ name: 'start', required: false, type: String, description: 'Optional start date in ISO format' })
  @ApiQuery({ name: 'end', required: false, type: String, description: 'Optional end date in ISO format' })
  @ApiResponse({ status: 200, description: 'Advanced anomaly detection array returned successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request (e.g. invalid date boundary start > end)' })
  @ApiResponse({ status: 403, description: 'Forbidden (Role VIEWER structurally rejected)' })
  @UseInterceptors(UserCacheInterceptor)
  @CacheTTL(60)
  async getTrends(@Req() req: any, @Query() query: GetTrendsDto) {
    return this.getTrendsUseCase.execute(req.user.sub || req.user.id, query.start, query.end);
  }
}
