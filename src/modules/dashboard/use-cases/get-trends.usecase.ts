import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class GetTrendsUseCase {
  constructor(private prisma: PrismaService) {}

  async execute(userId: string, startDate?: string, endDate?: string) {
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      throw new BadRequestException('start date cannot be after end date');
    }

    const where: any = { userId, deletedAt: null, type: 'EXPENSE' };

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    const records = await this.prisma.record.findMany({
      where,
      orderBy: { date: 'asc' },
    });

    const monthlyData: Record<string, number> = {};

    records.forEach((r) => {
      // Isolate 'YYYY-MM' strings 
      const monthStr = r.date.toISOString().slice(0, 7); 
      monthlyData[monthStr] = (monthlyData[monthStr] || 0) + r.amount;
    });

    const trends = Object.entries(monthlyData).map(([month, amount]) => ({
      month,
      amount,
    }));

    const totalAmount = trends.reduce((acc, t) => acc + t.amount, 0);
    const average = trends.length ? totalAmount / trends.length : 0;

    // Advanced Algorithm: Flag any month where spending spiked 50% above average historical records
    const anomalies = trends
      .filter((t) => t.amount > average * 1.5)
      .map((t) => ({
        month: t.month,
        amount: t.amount,
        average,
        spikePercentage: Math.round(((t.amount - average) / average) * 100 * 100) / 100,
      }));

    return { trends, average, anomalies };
  }
}
