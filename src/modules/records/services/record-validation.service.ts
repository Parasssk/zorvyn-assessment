import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class RecordValidationService {
  constructor(private prisma: PrismaService) {}

  validateRecordData(amount: number, date: string) {
    if (amount <= 0) {
      throw new BadRequestException('Amount must be greater than 0');
    }
    
    const recordDate = new Date(date);
    if (recordDate > new Date()) {
      throw new BadRequestException('Date cannot be in the future');
    }
  }

  async checkIfDuplicate(userId: string, amount: number, category: string, dateStr: string): Promise<boolean> {
    const recordDate = new Date(dateStr);
    
    const startOfDay = new Date(recordDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(recordDate);
    endOfDay.setHours(23, 59, 59, 999);

    const duplicate = await this.prisma.record.findFirst({
      where: {
        userId,
        amount,
        category,
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    return !!duplicate;
  }
}
