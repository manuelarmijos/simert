import { Controller, Get, Param } from '@nestjs/common';

import { PortalService } from './portal.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiStandardResponse } from 'src/common/decorators/api-standard-response.decorator';
// AQUI DEBEMOS AGREGAR LOS ENDPOINT PARA EL PORTAL Y VERIFICAR SI EL USUARIO YA FUE REGISTRADO O NO
@ApiTags('Api - Portal')
@ApiBearerAuth('keycloak')
@Controller('portal')
export class PortalController {
  constructor(private readonly portalService: PortalService) {}

  @ApiOperation({ summary: 'Placeholder: list all portal entries' })
  @ApiStandardResponse({
    description: 'Static placeholder message (not implemented)',
    data: {
      message: { type: 'string', example: 'This action returns all portal' },
    },
  })
  @Get()
  findAll() {
    return this.portalService.findAll();
  }

  @ApiOperation({ summary: 'Placeholder: get a portal entry by id' })
  @ApiStandardResponse({
    description: 'Static placeholder message (not implemented)',
    data: {
      message: { type: 'string', example: 'This action returns a #1 portal' },
    },
  })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.portalService.findOne(+id);
  }
}