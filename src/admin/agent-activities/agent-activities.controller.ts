import { Controller, Get, Param, ParseIntPipe, ParseUUIDPipe, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthWithKeycloak, GetUser } from 'src/auth/decorators';
import { JwtPayload } from 'src/auth/interfaces';
import { FilterDto } from 'src/common/dto/filter.dto';

import { AgentActivitiesService } from './agent-activities.service';
@ApiTags('Admin - Agent Activities')
@ApiBearerAuth('keycloak')
@Controller('admin/agent-activities')
export class AgentActivitiesController {
  constructor(private readonly agentActivitiesService: AgentActivitiesService) { }

  @ApiOperation({ summary: 'List agent activity records with optional filters' })
  // @Auth()
  @AuthWithKeycloak()
  @Get(':userId/:idDevice/:version')
  findAll(
    @GetUser() user: JwtPayload,
    @Param('userId', ParseIntPipe) userId: number,
    @Param('idDevice', ParseUUIDPipe) idDevice: string,
    @Param('version', ParseIntPipe) version: number,
    @Query() filterDto: FilterDto
  ) {
    return this.agentActivitiesService.findAll(filterDto);
  }

  @ApiOperation({ summary: 'Count total agent activity records matching filters' })
  // @Auth()
  @AuthWithKeycloak()
  @Get('total/:userId/:idDevice/:version')
  findAllTotal(
    @GetUser() user: JwtPayload,
    @Param('userId', ParseIntPipe) userId: number,
    @Param('idDevice', ParseUUIDPipe) idDevice: string,
    @Param('version', ParseIntPipe) version: number,
    @Query() filterDto: FilterDto
  ) {
    return this.agentActivitiesService.findAllTotal(filterDto);
  }
}
