import {
  Body,
  Controller,
  Post,
  Get,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { RagService } from './rag.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { User } from '../auth/decorators/current-user.decorator';

@Controller('rag')
export class RagController {
  constructor(private readonly ragService: RagService) {}

  @Get('documents')
  @UseGuards(JwtAuthGuard)
  async listDocuments(
    @CurrentUser() user: User,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.ragService.listDocuments(user.organizationId, {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
  }

  @Post('documents')
  @UseInterceptors(FileInterceptor('file'))
  @UseGuards(JwtAuthGuard)
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: User,
  ) {
    return this.ragService.ingestFile(user.organizationId, user.userId, file);
  }

  @Post('ask')
  @UseGuards(JwtAuthGuard)
  async ask(
    @Body() body: { fileId: string; question: string },
    @CurrentUser() user: User,
  ) {
    return this.ragService.askQuestion(
      user.organizationId,
      body.fileId,
      body.question,
    );
  }
}
