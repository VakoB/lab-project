import { Module } from '@nestjs/common';
import { FilesService } from './services/files.service';
import { FilesController } from './files.controller';

import { ClamAvService } from './services/clamav.service';
import { MinioService } from './services/minio.service';

@Module({
  providers: [FilesService, ClamAvService, MinioService],
  controllers: [FilesController],
})
export class FilesModule {}
