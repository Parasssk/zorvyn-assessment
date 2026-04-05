import { Injectable, NotFoundException } from '@nestjs/common';
import { RecordsRepository } from '../repositories/records.repository';
import { UpdateRecordDto } from '../dto/update-record.dto';
import { RecordValidationService } from '../services/record-validation.service';

@Injectable()
export class UpdateRecordUseCase {
  constructor(
    private recordsRepo: RecordsRepository,
    private validationService: RecordValidationService,
  ) {}

  async execute(id: string, userId: string, dto: UpdateRecordDto) {
    const record = await this.recordsRepo.findOne(id);
    if (!record || record.deletedAt || record.userId !== userId) {
      throw new NotFoundException('Record not found');
    }

    if (dto.amount !== undefined || dto.date !== undefined) {
      const amount = dto.amount !== undefined ? dto.amount : record.amount;
      const date = dto.date !== undefined ? dto.date : record.date.toISOString();
      this.validationService.validateRecordData(amount, date);
    }

    const data: any = { ...dto };
    if (dto.date) {
      data.date = new Date(dto.date);
    }

    return this.recordsRepo.update(id, data);
  }
}
