import { Body, Controller, Get, Param, ParseIntPipe, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { FilterDto } from "../../common/dto/filter.dto";
import { CardService } from './card.service';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
@ApiTags('Admin - Card')
@ApiBearerAuth('keycloak')
@Controller('admin/card')
export class CardController {
  constructor(private readonly cardService: CardService) { }

  @ApiOperation({ summary: 'Create a new card' })
  @Post(':userId/:idDevice/:version')
  create(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('idDevice', ParseUUIDPipe) idDevice: string,
    @Param('version', ParseIntPipe) version: number,
    @Body() createCardDto: CreateCardDto) {
    return this.cardService.create(userId, createCardDto);
  }

  @ApiOperation({ summary: 'List cards with optional filters' })
  @Get(':userId/:idDevice/:version')
  findAll(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('idDevice', ParseUUIDPipe) idDevice: string,
    @Param('version', ParseIntPipe) version: number,
    @Query() filterDto: FilterDto,
  ) {
    return this.cardService.findAll(filterDto);
  }

  @ApiOperation({ summary: 'Count total cards with optional filters' })
  @Get('find-total/:userId/:idDevice/:version')
  findAllTotal(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('idDevice', ParseUUIDPipe) idDevice: string,
    @Param('version', ParseIntPipe) version: number,
    @Query() filterDto: FilterDto,
  ) {
    return this.cardService.findAllTotal(filterDto);
  }

  @ApiOperation({ summary: 'Update a card by id' })
  @Patch(':id/:userId/:idDevice/:version')
  update(
    @Param('id') id: string,
    @Param('userId', ParseIntPipe) userId: number,
    @Param('idDevice', ParseUUIDPipe) idDevice: string,
    @Param('version', ParseIntPipe) version: number,
    @Body() updateCardDto: UpdateCardDto
  ) {
    return this.cardService.update(+id, updateCardDto);
  }
}
