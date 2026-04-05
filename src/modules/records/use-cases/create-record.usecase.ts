import { Injectable } from '@nestjs/common';
import { RecordsRepository } from '../repositories/records.repository';
import { RecordValidationService } from '../services/record-validation.service';
import { CreateRecordDto } from '../dto/create-record.dto';

@Injectable()
export class CreateRecordUseCase {
  constructor(
    private recordsRepo: RecordsRepository,
    private validationService: RecordValidationService,
  ) {}

  async execute(userId: string, dto: CreateRecordDto) {
    this.validationService.validateRecordData(dto.amount, dto.date);

    const isDuplicate = await this.validationService.checkIfDuplicate(
      userId,
      dto.amount,
      dto.category,
      dto.date,
    );

    return this.recordsRepo.create({
      user: { connect: { id: userId } },
      amount: dto.amount,
      type: dto.type,
      category: dto.category,
      date: new Date(dto.date),
      notes: dto.notes,
      isDuplicate,
    });
  }
}
