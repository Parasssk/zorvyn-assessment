import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class GetCategoryBreakdownUseCase {
  constructor(private prisma: PrismaService) {}

  async execute(userId: string) {
    const records = await this.prisma.record.findMany({
      where: { userId, deletedAt: null, type: 'EXPENSE' },
      select: { amount: true, category: true },
    });

    const categoryMap: Record<string, number> = {};
    records.forEach((r) => {
      categoryMap[r.category] = (categoryMap[r.category] || 0) + r.amount;
    });

    const breakdown = Object.entries(categoryMap)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount); // Sort by highest spenders

    return breakdown;
  }
}
