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
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { UserEntity } from './entities/user.entity';

@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get a user by ID' })
  @ApiParam({ name: 'id', description: 'The unique ID of the user' })
  @ApiResponse({ status: 200, description: 'User found.', type: UserEntity })
  @ApiResponse({ status: 404, description: 'User not found.' })
  async findById(@Param('id') id: string) {
    return await this.userService.findById(id);
  }

  @Get()
  @ApiOperation({ summary: 'List all users with cursor-based pagination' })
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
  @ApiResponse({ status: 200, description: 'Users retrieved successfully.' })
  async findAll(
    @Query('take', ParseIntPipe) take: number,
    @Query('cursor') cursor: string,
  ) {
    return await this.userService.findAll(take, cursor);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new user profile' })
  @ApiResponse({
    status: 201,
    description: 'User created successfully.',
    type: UserEntity,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid validation payload structural elements.',
  })
  async create(@Body() userData: CreateUserDto) {
    return await this.userService.create(userData);
  }

  @Patch(':id')
  @ApiOperation({ summary: "Update an existing user's profile details" })
  @ApiParam({ name: 'id', description: 'The unique ID of the user to modify' })
  @ApiResponse({
    status: 200,
    description: 'User records updated successfully.',
    type: UserEntity,
  })
  @ApiResponse({ status: 404, description: 'User profile not found.' })
  async update(@Param('id') id: string, @Body() userData: UpdateUserDto) {
    return this.userService.update(id, userData);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete a user profile instance' })
  @ApiParam({ name: 'id', description: 'The unique ID of the user to remove' })
  @ApiResponse({
    status: 204,
    description: 'User successfully purged from platform.',
  })
  @ApiResponse({ status: 404, description: 'User profile not found.' })
  async delete(@Param('id') id: string) {
    return this.userService.delete(id);
  }
}
