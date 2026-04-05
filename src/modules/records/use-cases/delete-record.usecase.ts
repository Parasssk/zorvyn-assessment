import { Injectable, NotFoundException } from '@nestjs/common';
import { RecordsRepository } from '../repositories/records.repository';

@Injectable()
export class DeleteRecordUseCase {
  constructor(private recordsRepo: RecordsRepository) {}

  async execute(id: string, userId: string) {
    const record = await this.recordsRepo.findOne(id);
    if (!record || record.deletedAt || record.userId !== userId) {
      throw new NotFoundException('Record not found');
    }

    return this.recordsRepo.softDelete(id, userId);
  }
}
