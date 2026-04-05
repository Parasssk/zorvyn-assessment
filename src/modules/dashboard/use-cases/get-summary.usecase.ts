import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class GetSummaryUseCase {
  constructor(private prisma: PrismaService) {}

  async execute(userId: string) {
    const records = await this.prisma.record.findMany({
      where: { userId, deletedAt: null },
      select: { amount: true, type: true },
    });

    let totalIncome = 0;
    let totalExpense = 0;

    records.forEach((r) => {
      if (r.type === 'INCOME') totalIncome += r.amount;
      if (r.type === 'EXPENSE') totalExpense += r.amount;
    });

    const netBalance = totalIncome - totalExpense;
    const rawSavingsRatio = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0;
    
    // Clamp savings ratio between 0 and 100%
    const savingsRatio = Math.max(0, Math.min(100, Math.round(rawSavingsRatio * 100) / 100));

    return {
      totalIncome,
      totalExpense,
      netBalance,
      savingsRatio,
      burnRate: totalExpense,
    };
  }
}
