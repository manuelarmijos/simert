import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { CheckboxUserService } from './checkbox-user.service';
import { CreateCheckboxUserDto } from './dto/create-checkbox-user.dto';
import { UpdateCheckboxUserDto } from './dto/update-checkbox-user.dto';
@ApiTags('Admin - Checkbox User')
@ApiBearerAuth('keycloak')
@Controller('admin/checkbox-user')
export class CheckboxUserController {
  constructor(private readonly checkboxUserService: CheckboxUserService) { }

  @ApiOperation({ summary: 'Create a new checkbox-user association' })
  @Post()
  create(@Body() createCheckboxUserDto: CreateCheckboxUserDto) {
    return this.checkboxUserService.create(createCheckboxUserDto);
  }

  @ApiOperation({ summary: 'List all checkbox-user associations' })
  @Get()
  findAll() {
    return this.checkboxUserService.findAll();
  }

  @ApiOperation({ summary: 'Get a single checkbox-user association by id' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.checkboxUserService.findOne(+id);
  }

  @ApiOperation({ summary: 'Update a checkbox-user association by id' })
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCheckboxUserDto: UpdateCheckboxUserDto) {
    return this.checkboxUserService.update(+id, updateCheckboxUserDto);
  }

  @ApiOperation({ summary: 'Delete a checkbox-user association by id' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.checkboxUserService.remove(+id);
  }
}
