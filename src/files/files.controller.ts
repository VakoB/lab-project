import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { ApiConsumes, ApiTags } from '@nestjs/swagger';
import { FilesService } from './services/files.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

interface AuthUser {
  userId: string;
  organizationId: string;
}

@ApiTags('Files')
@Controller('files')
export class FilesController {
  constructor(private filesService: FilesService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: AuthUser,
  ) {
    return this.filesService.upload(
      file.buffer,
      file.originalname,
      file.mimetype,
      user.organizationId,
      user.userId,
    );
  }

  @Get()
  list(
    @CurrentUser() user: AuthUser,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.filesService.list(user.organizationId, {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
  }

  @Get(':id/download')
  async download(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
    @Res() res: Response,
  ) {
    const { buffer, file } = await this.filesService.download(
      id,
      user.organizationId,
    );

    res.set({
      'Content-Type': file.mimeType,
      'Content-Disposition': `attachment; filename="${file.originalName}"`,
      'Content-Length': buffer.length,
    });

    res.send(buffer);
  }

  @Delete(':id')
  delete(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.filesService.delete(id, user.organizationId);
  }
}
