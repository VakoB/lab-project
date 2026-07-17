import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ConversationService } from './conversation.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { UpdateConversationDto } from './dto/update-conversation.dto';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { ConversationEntity } from './entities/conversation.entity';
import { ApiPaginatedResponse } from '../utils/decorators/api-paginated-response.decorator';

@ApiTags('conversations')
@Controller('conversations')
export class ConversationController {
  constructor(private conversationService: ConversationService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get a conversation by ID' })
  @ApiParam({ name: 'id', description: 'The unique ID of the conversation' })
  @ApiResponse({
    status: 200,
    description: 'Conversation found.',
    type: ConversationEntity,
  })
  @ApiResponse({ status: 404, description: 'Conversation not found.' })
  async findById(@Param('id') id: string) {
    return await this.conversationService.findById(id);
  }

  @Get()
  @ApiOperation({ summary: 'List conversations with cursor-based pagination' })
  @ApiQuery({
    name: 'ownerId',
    required: true,
    description: 'Filter conversations by owner user ID',
  })
  @ApiQuery({
    name: 'take',
    required: true,
    description: 'Number of records to take',
    type: Number,
  })
  @ApiQuery({
    name: 'cursor',
    required: false,
    description: 'The cursor ID for pagination',
  })
  @ApiResponse({
    status: 200,
    description: 'Conversations retrieved successfully.',
  })
  @ApiPaginatedResponse(
    ConversationEntity,
    'Conversations retrieved successfully.',
  )
  async findAll(
    @Query('ownerId') ownerId: string,
    @Query('take', ParseIntPipe) take: number,
    @Query('cursor') cursor: string,
  ) {
    return await this.conversationService.findAll(ownerId, take, cursor);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new conversation' })
  @ApiResponse({
    status: 201,
    description: 'Conversation created successfully.',
    type: ConversationEntity,
  })
  @ApiResponse({ status: 400, description: 'Invalid validation payload.' })
  async create(@Body() conversationData: CreateConversationDto) {
    return await this.conversationService.create(conversationData);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an existing conversation' })
  @ApiParam({
    name: 'id',
    description: 'The unique ID of the conversation to update',
  })
  @ApiResponse({
    status: 200,
    description: 'Conversation updated successfully.',
    type: ConversationEntity,
  })
  @ApiResponse({ status: 404, description: 'Conversation not found.' })
  async update(
    @Param('id') id: string,
    @Body() conversationData: UpdateConversationDto,
  ) {
    return this.conversationService.update(id, conversationData);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Soft-delete or delete a conversation' })
  @ApiParam({
    name: 'id',
    description: 'The unique ID of the conversation to delete',
  })
  @ApiResponse({
    status: 204,
    description: 'Conversation removed successfully.',
  })
  @ApiResponse({ status: 404, description: 'Conversation not found.' })
  async delete(@Param('id') id: string) {
    return this.conversationService.delete(id);
  }
}
