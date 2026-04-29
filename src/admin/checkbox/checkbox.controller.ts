import { Body, Controller, Get, Param, ParseIntPipe, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthWithKeycloak, GetUser } from 'src/auth/decorators';
import { JwtPayload } from 'src/auth/interfaces';
import { FilterDto } from 'src/common/dto/filter.dto';

import { CheckboxService } from './checkbox.service';
@ApiTags('Admin - Checkbox')
@ApiBearerAuth('keycloak')
@Controller('admin/checkbox')
export class CheckboxController {
  constructor(private readonly checkboxService: CheckboxService) { }

  @ApiOperation({ summary: 'List all checkboxes with optional filters (admin)' })
  // @Auth()
  @AuthWithKeycloak()
  @Get(':userId/:idDevice/:version')
  findAll(
    @GetUser() user: JwtPayload,
    @Param('userId', ParseIntPipe) userId: number,
    @Param('idDevice', ParseUUIDPipe) idDevice: string,
    @Param('version', ParseIntPipe) version: number,
    @Query() filterDto: FilterDto,
  ) {
    return this.checkboxService.findAll(filterDto);
  }

  // ─── Endpoints internos consumidos por CommonCheckboxService ─────────────

  @ApiOperation({ summary: 'List paid checkboxes with no linked incident (statusIncident = NULL)' })
  /**
   * Retorna los checkboxes PAGADOS cuyo statusIncident es NULL.
   * GET /admin/checkbox/common/paid-without-incident
   */
  @Get('common/paid-without-incident')
  findPaidWithoutIncident() {
    return this.checkboxService.findPaidWithoutIncident();
  }

  @ApiOperation({ summary: 'List paid checkboxes with a pending GIM incident status' })
  /**
   * Retorna los checkboxes PAGADOS con statusIncident pendiente en el GIM.
   * GET /admin/checkbox/common/paid-pending-incident
   */
  @Get('common/paid-pending-incident')
  findPaidWithPendingIncident() {
    return this.checkboxService.findPaidWithPendingIncident();
  }

  @ApiOperation({ summary: 'Update a checkbox by id (partial update, any field except id)' })
  /**
   * Actualiza un checkbox por su id.
   * PATCH /admin/checkbox/common/update/:id
   * Body: objeto parcial de Checkbox (sin 'id').
   */
  @Patch('common/update/:id')
  updateCheckboxById(
    @Param('id', ParseIntPipe) id: number,
    @Body() fields: Record<string, any>,
  ) {
    return this.checkboxService.updateCheckboxById(id, fields);
  }

  @ApiOperation({ summary: 'Move a checkbox record to its history table' })
  /**
   * Transfiere un checkbox a la tabla histórica correspondiente.
   * POST /admin/checkbox/common/move-to-history/:id
   */
  @Post('common/move-to-history/:id')
  moveCheckboxToHistory(@Param('id', ParseIntPipe) id: number) {
    return this.checkboxService.moveCheckboxToHistory(id);
  }
}
