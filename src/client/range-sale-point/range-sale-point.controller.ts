import { Controller, Get, Param } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { RangeSalePointService } from './range-sale-point.service';
import { AuthWithKeycloak } from 'src/auth/decorators';
@ApiTags('Client - Range Sale Point')
@ApiBearerAuth('keycloak')
@Controller('client/range-sale-point')
export class RangeSalePointController {
  constructor(private readonly rangeSalePointService: RangeSalePointService) { }

  @ApiOperation({ summary: 'Get the range sale point assignment for the authenticated user' })
  // @Auth()
  @AuthWithKeycloak()
  @Get('get-range-sale-point-by-userid/:userId/:idDevice')
  getRangeSalePointByUserId(
    // @GetUser() user: JwtPayload,
    @Param('userId') userId: string,
    @Param('idDevice') idDevice: string,
  ) {
    return this.rangeSalePointService.getRangeSalePointByUserId(+userId);
  }

}
