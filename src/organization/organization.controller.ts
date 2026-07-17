import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { OrganizationService } from './organization.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { ApiOperation, ApiResponse, ApiTags, ApiParam } from '@nestjs/swagger';
import { OrganizationEntity } from './entities/organization.entity';
import { ApiPaginatedResponse } from 'src/utils/decorators/api-paginated-response.decorator';

@ApiTags('organizations')
@Controller('organizations')
export class OrganizationController {
  constructor(private organizationService: OrganizationService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get an organization by ID' })
  @ApiParam({ name: 'id', description: 'The unique ID of the organization' })
  @ApiResponse({
    status: 200,
    description: 'Organization found.',
    type: OrganizationEntity,
  })
  @ApiResponse({ status: 404, description: 'Organization not found.' })
  async findById(@Param('id') id: string) {
    return await this.organizationService.findById(id);
  }

  @Get()
  @ApiOperation({ summary: 'List all organizations' })
  @ApiPaginatedResponse(
    OrganizationEntity,
    'Organizations retrieved successfully.',
  )
  @ApiResponse({
    status: 200,
    description: 'Organizations retrieved successfully.',
    type: [OrganizationEntity],
  })
  async findAll() {
    return await this.organizationService.findAll();
  }

  @Post()
  @ApiOperation({ summary: 'Create a new organization' })
  @ApiResponse({
    status: 201,
    description: 'Organization created successfully.',
    type: OrganizationEntity,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid payload structure passed validation.',
  })
  async create(@Body() organizationData: CreateOrganizationDto) {
    return await this.organizationService.create(organizationData);
  }

  @Patch(':id')
  @ApiOperation({ summary: "Update an organization's details" })
  @ApiParam({
    name: 'id',
    description: 'The unique ID of the organization to modify',
  })
  @ApiResponse({
    status: 200,
    description: 'Organization updated successfully.',
    type: OrganizationEntity,
  })
  @ApiResponse({ status: 404, description: 'Organization not found.' })
  async update(
    @Param('id') id: string,
    @Body() organizationData: UpdateOrganizationDto,
  ) {
    return this.organizationService.update(id, organizationData);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete an organization' })
  @ApiParam({
    name: 'id',
    description: 'The unique ID of the organization to delete',
  })
  @ApiResponse({
    status: 204,
    description: 'Organization removed successfully.',
  })
  @ApiResponse({ status: 404, description: 'Organization not found.' })
  async delete(@Param('id') id: string) {
    return this.organizationService.delete(id);
  }
}
