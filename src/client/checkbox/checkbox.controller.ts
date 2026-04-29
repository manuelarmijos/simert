import { Body, Controller, Delete, Get, Param, ParseIntPipe, ParseUUIDPipe, Patch, Post, Query, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthWithKeycloak, GetUser } from 'src/auth/decorators';
import { JwtPayload } from 'src/auth/interfaces';
import { GetTransactionDto } from 'src/common/dto/get-transaction.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { SystemStatusInterceptor } from 'src/common/interceptors/system-status.interceptor';

import { CheckboxService } from './checkbox.service';
import { CreateCheckboxDto } from './dto/create-checkbox.dto';
@ApiTags('Client - Checkbox')
@ApiBearerAuth('keycloak')
@Controller('client/checkbox')
export class CheckboxController {
  constructor(private readonly checkboxService: CheckboxService) { }

  @ApiOperation({ summary: 'List checkbox transactions for the authenticated user with date filters' })
  // @Auth()
  @AuthWithKeycloak()
  @Post('get-transactions/:userId/:idDevice/:version')
  getTransactions(
    @GetUser() user: JwtPayload,
    @Param('userId', ParseIntPipe) userId: number,
    @Param('idDevice', ParseUUIDPipe) idDevice: string,
    @Body() getTransactionDto: GetTransactionDto,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.checkboxService.getTransactions(userId, getTransactionDto, paginationDto);
  }

  @ApiOperation({ summary: 'Get a single checkbox transaction by its id' })
  // @Auth()
  @AuthWithKeycloak()
  @Get('get-transactions-by-id/:userId/:idDevice/:id/:version')
  getTransactionsById(
    @GetUser() user: JwtPayload,
    @Param('userId', ParseIntPipe) userId: number,
    @Param('idDevice', ParseUUIDPipe) idDevice: string,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.checkboxService.getTransactionsById(userId, id);
  }

  @ApiOperation({ summary: 'Purchase checkboxes (initiates a payment flow)' })
  @AuthWithKeycloak()
  @UseInterceptors(SystemStatusInterceptor)
  @Post('buy-checkboxs/:userId/:idDevice/:version')
  parking(
    @GetUser() user: JwtPayload,
    @Param('userId', ParseIntPipe) userId: number,
    @Param('idDevice', ParseUUIDPipe) idDevice: string,
    @Param('version', ParseIntPipe) version: number,
    @Body() createCheckboxDto: CreateCheckboxDto
  ) {
    return this.checkboxService.buyCheckboxs(idDevice, createCheckboxDto);
  }

  @ApiOperation({ summary: 'Get card info and current checkbox balance for the user' })
  @AuthWithKeycloak()
  @Get('get-cards-checkboxes/:userId/:idDevice/:version')
  getCardsAndCheckboxes(
    @GetUser() user: JwtPayload,
    @Param('userId', ParseIntPipe) userId: number,
    @Param('idDevice', ParseUUIDPipe) idDevice: string,
    @Param('version', ParseIntPipe) version: number,
  ) {
    return this.checkboxService.getCardsAndCheckboxes(userId);
  }

  @ApiOperation({ summary: 'Webhook: checkbox payment success callback from payment provider' })
  // @Auth()
  @Patch('on-response-pay/:idDevice/:userId/:checkboxId/:typePaymentMethod/:register/:typePaymentResponsibility/')
  onResponse(
    // @GetUser() user: JwtPayload,
    @Param('userId', ParseIntPipe) userId: number,
    @Param('typePaymentResponsibility', ParseIntPipe) typePaymentResponsibility: number,
    @Param('typePaymentMethod', ParseIntPipe) typePaymentMethod: number,
    @Param('checkboxId', ParseIntPipe) checkboxId: number,
    @Param('idDevice', ParseUUIDPipe) idDevice: string,
    @Param('register') register: string,
  ) {
    return this.checkboxService.onResponsePay(idDevice, userId, checkboxId, typePaymentMethod, register, typePaymentResponsibility)
  }

  @ApiOperation({ summary: 'Webhook: checkbox payment error/cancellation callback from payment provider' })
  // @Auth()
  @Delete('on-response-pay/:idDevice/:userId/:checkboxId/:typePaymentMethod/:register/:typePaymentResponsibility/')
  onResponsePayError(
    // @GetUser() user: JwtPayload,
    @Param('userId', ParseIntPipe) userId: number,
    @Param('typePaymentResponsibility', ParseIntPipe) typePaymentResponsibility: number,
    @Param('typePaymentMethod', ParseIntPipe) typePaymentMethod: number,
    @Param('checkboxId', ParseIntPipe) checkboxId: number,
    @Param('idDevice', ParseUUIDPipe) idDevice: string,
    @Param('register') register: string,
    @Param('regiconceptster') concept: string,
  ) {
    return this.checkboxService.onResponsePayError(idDevice, userId, checkboxId, typePaymentMethod, register, typePaymentResponsibility)
  }

}
