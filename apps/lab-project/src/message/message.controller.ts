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
import { MessageService } from './message.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { MessageEntity } from './entities/message.entity';
import { ApiPaginatedResponse } from '../utils/decorators/api-paginated-response.decorator';

@ApiTags('messages')
@Controller('messages')
export class MessageController {
  constructor(private messageService: MessageService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get a message by ID' })
  @ApiParam({ name: 'id', description: 'The unique ID of the message' })
  @ApiResponse({
    status: 200,
    description: 'Message found.',
    type: MessageEntity,
  })
  @ApiResponse({ status: 404, description: 'Message not found.' })
  async findById(@Param('id') id: string) {
    return await this.messageService.findById(id);
  }

  @Get()
  @ApiOperation({
    summary: 'List messages belonging to a conversation with cursor pagination',
  })
  @ApiQuery({
    name: 'conversationId',
    required: true,
    description: 'Filter messages by target conversation ID',
  })
  @ApiQuery({
    name: 'take',
    required: true,
    description: 'Number of records to return',
    type: Number,
  })
  @ApiQuery({
    name: 'cursor',
    required: false,
    description: 'The cursor ID for pagination',
  })
  @ApiResponse({ status: 200, description: 'Messages retrieved successfully.' })
  @ApiPaginatedResponse(MessageEntity, 'Messages retrieved successfully.')
  async findAll(
    @Query('conversationId') conversationId: string,
    @Query('take', ParseIntPipe) take: number,
    @Query('cursor') cursor: string,
  ) {
    return await this.messageService.findAll(conversationId, take, cursor);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new message' })
  @ApiResponse({
    status: 201,
    description: 'Message created successfully.',
    type: MessageEntity,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid payload structure passed validation.',
  })
  async create(@Body() messageData: CreateMessageDto) {
    return await this.messageService.create(messageData);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update message contents' })
  @ApiParam({
    name: 'id',
    description: 'The unique ID of the message to modify',
  })
  @ApiResponse({
    status: 200,
    description: 'Message updated successfully.',
    type: MessageEntity,
  })
  @ApiResponse({ status: 404, description: 'Message not found.' })
  async update(@Param('id') id: string, @Body() messageData: UpdateMessageDto) {
    return this.messageService.update(id, messageData);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Soft-delete or purge a message' })
  @ApiParam({
    name: 'id',
    description: 'The unique ID of the message to delete',
  })
  @ApiResponse({ status: 204, description: 'Message removed successfully.' })
  @ApiResponse({ status: 404, description: 'Message not found.' })
  async delete(@Param('id') id: string) {
    return this.messageService.delete(id);
  }
}
