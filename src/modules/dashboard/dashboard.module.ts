import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { GetSummaryUseCase } from './use-cases/get-summary.usecase';
import { GetCategoryBreakdownUseCase } from './use-cases/get-category-breakdown.usecase';
import { GetTrendsUseCase } from './use-cases/get-trends.usecase';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [DashboardController],
  providers: [
    GetSummaryUseCase,
    GetCategoryBreakdownUseCase,
    GetTrendsUseCase,
  ],
})
export class DashboardModule {}
