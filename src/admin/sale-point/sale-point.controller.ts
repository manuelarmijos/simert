import { Body, Controller, Get, Param, ParseIntPipe, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FilterDto } from 'src/common/dto/filter.dto';

import { CreateSalePointDto } from './dto/create-sale-point.dto';
import { UpdateSalePointDto } from './dto/update-sale-point.dto';
import { SalePointService } from './sale-point.service';
@ApiTags('Admin - Sale Point')
@ApiBearerAuth('keycloak')
@Controller('admin/sale-point')
export class SalePointController {
  constructor(private readonly salePointService: SalePointService) { }

  @ApiOperation({ summary: 'Create a new sale point linked to a user' })
  // @Auth(TypeRol.ADMIN)
  @Post(':userId/:idDevice/:version')
  create(
    // @GetUser() user: JwtPayload,
    @Param('userId', ParseIntPipe) userId: number,
    @Param('idDevice', ParseUUIDPipe) idDevice: string,
    @Param('version', ParseIntPipe) version: number,
    @Body() createSalePointDto: CreateSalePointDto
  ) {
    return this.salePointService.create(userId, createSalePointDto);
  }

  @ApiOperation({ summary: 'List sale points with optional filters' })
  // @Auth(TypeRol.ADMIN)
  @Get(':userId/:idDevice/:version')
  findAll(
    // @GetUser() user: JwtPayload,
    @Param('userId', ParseIntPipe) userId: number,
    @Param('idDevice', ParseUUIDPipe) idDevice: string,
    @Param('version', ParseIntPipe) version: number,
    @Query() filterDto: FilterDto
  ) {
    return this.salePointService.findAll(filterDto);
  }

  @ApiOperation({ summary: 'List sale points applying additional filter criteria' })
  // @Auth(TypeRol.ADMIN)
  @Get('filter/:userId/:idDevice/:version')
  findAllFilter(
    // @GetUser() user: JwtPayload,
    @Param('userId', ParseIntPipe) userId: number,
    @Param('idDevice', ParseUUIDPipe) idDevice: string,
    @Param('version', ParseIntPipe) version: number,
    @Query() filterDto: FilterDto
  ) {
    return this.salePointService.findAllFilter(filterDto);
  }

  @ApiOperation({ summary: 'Count total sale points matching filters' })
  // @Auth(TypeRol.ADMIN)
  @Get('total/:userId/:idDevice/:version')
  findAllTotal(
    // @GetUser() user: JwtPayload,
    @Param('userId', ParseIntPipe) userId: number,
    @Param('idDevice', ParseUUIDPipe) idDevice: string,
    @Param('version', ParseIntPipe) version: number,
    @Query() filterDto: FilterDto
  ) {
    return this.salePointService.findAllTotal(filterDto);
  }

  @ApiOperation({ summary: 'Update a sale point by id' })
  // @Auth(TypeRol.ADMIN)
  @Patch(':id/:userId/:idDevice/:version')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Param('userId', ParseIntPipe) userId: number,
    @Param('idDevice', ParseUUIDPipe) idDevice: string,
    @Param('version', ParseIntPipe) version: number,
    @Body() updateSalePointDto: UpdateSalePointDto
  ) {
    return this.salePointService.update(userId, id, updateSalePointDto);
  }

  @ApiOperation({ summary: 'Check whether a sale point exists for a given userId' })
  // @Auth(TypeRol.ADMIN)
  @Get('exists/:targetUserId/:userId/:idDevice/:version')
  existsByUserId(
    @Param('targetUserId', ParseIntPipe) targetUserId: number,
    @Param('userId', ParseIntPipe) _userId: number,
    @Param('idDevice', ParseUUIDPipe) _idDevice: string,
    @Param('version', ParseIntPipe) _version: number,
  ) {
    return this.salePointService.existsByUserId(targetUserId);
  }
}
