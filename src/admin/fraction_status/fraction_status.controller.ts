import { Controller, Get, Param, Query } from '@nestjs/common';
import { FilterDto } from 'src/common/dto/filter.dto';

import { FractionStatusService } from './fraction_status.service';

import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
@ApiTags('Admin - Fraction Status')
@ApiBearerAuth('keycloak')
@Controller('admin/fraction-status')
export class FractionStatusController {
  constructor(private readonly fractionStatusService: FractionStatusService) { }

  @ApiOperation({ summary: 'List status history records for a given fraction id' })
  @Get('/:fractionId')
  findAll(
    @Param('fractionId') fractionId: number,
    @Query() filterDto?: FilterDto,
  ) {
    return this.fractionStatusService.findAllFractionState(fractionId,filterDto);
  }

}
