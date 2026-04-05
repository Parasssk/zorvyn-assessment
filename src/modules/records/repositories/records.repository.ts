import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class RecordsRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.RecordCreateInput) {
    return this.prisma.record.create({ data });
  }

  async findMany(params: {
    skip?: number;
    take?: number;
    where?: Prisma.RecordWhereInput;
    orderBy?: Prisma.RecordOrderByWithRelationInput;
  }) {
    const { skip, take, where, orderBy } = params;
    const [records, total] = await Promise.all([
      this.prisma.record.findMany({ skip, take, where, orderBy }),
      this.prisma.record.count({ where }),
    ]);
    return { records, total };
  }

  async findOne(id: string) {
    return this.prisma.record.findUnique({ where: { id } });
  }

  async update(id: string, data: Prisma.RecordUpdateInput) {
    return this.prisma.record.update({ where: { id }, data });
  }

  async softDelete(id: string, userId: string) {
    return this.prisma.record.update({
      where: { id },
      data: { deletedAt: new Date(), deletedBy: userId },
    });
  }
}
