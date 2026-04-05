import { Injectable } from '@nestjs/common';
import { RecordsRepository } from '../repositories/records.repository';
import { GetRecordsDto } from '../dto/get-records.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class GetRecordsUseCase {
  constructor(private recordsRepo: RecordsRepository) {}

  async execute(userId: string, dto: GetRecordsDto) {
    const { page = 1, limit = 10, search, type, category } = dto;
    const validPage = Math.max(1, page);
    const validLimit = Math.min(100, Math.max(1, limit));
    const skip = (validPage - 1) * validLimit;

    const where: Prisma.RecordWhereInput = {
      userId,
      deletedAt: null,
    };

    if (type) {
      where.type = type;
    }

    if (category) {
      where.category = category;
    }

    if (search) {
      where.OR = [
        { category: { contains: search, mode: 'insensitive' } },
        { notes: { contains: search, mode: 'insensitive' } },
      ];
    }

    const { records, total } = await this.recordsRepo.findMany({
      skip,
      take: validLimit,
      where,
      orderBy: { date: 'desc' },
    });

    return {
      data: records,
      meta: {
        total,
        page: validPage,
        limit: validLimit,
        totalPages: Math.ceil(total / validLimit),
      },
    };
  }
}
