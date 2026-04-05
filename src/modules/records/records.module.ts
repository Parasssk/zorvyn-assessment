import { Module } from '@nestjs/common';
import { RecordsController } from './records.controller';
import { RecordsRepository } from './repositories/records.repository';
import { RecordValidationService } from './services/record-validation.service';
import { CreateRecordUseCase } from './use-cases/create-record.usecase';
import { UpdateRecordUseCase } from './use-cases/update-record.usecase';
import { DeleteRecordUseCase } from './use-cases/delete-record.usecase';
import { GetRecordsUseCase } from './use-cases/get-records.usecase';

@Module({
  controllers: [RecordsController],
  providers: [
    RecordsRepository,
    RecordValidationService,
    CreateRecordUseCase,
    UpdateRecordUseCase,
    DeleteRecordUseCase,
    GetRecordsUseCase,
  ],
  exports: [RecordsRepository]
})
export class RecordsModule {}
