import { Module } from '@nestjs/common';
import { FileProcessorController } from './file-processor.controller';
import { FileProcessorService } from './file-processor.service';
import { MinioService } from './minio.service';
import { ExcelParserService } from './excel-parser.service';

@Module({
  controllers: [FileProcessorController],
  providers: [FileProcessorService, MinioService, ExcelParserService],
})
export class WorkerModule {}
