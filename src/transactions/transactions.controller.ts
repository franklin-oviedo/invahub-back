import {
  Body,
  Controller,
  Get,
  Post,
  Query,
} from '@nestjs/common';

import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';

import { CreateTransactionDto } from './dto/create-transaction.dto';
import { Investor } from './enum/investor.enum';
import { TransactionsService } from './transactions.service';

@ApiTags('Transactions')
@Controller('transactions')
export class TransactionsController {
  constructor(
    private readonly transactionsService: TransactionsService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Registrar una transacción',
    description:
      'Registra una inversión o retorno. El backend calcula automáticamente el capital y la ganancia.',
  })
  @ApiCreatedResponse({
    description:
      'Transacción registrada correctamente',
  })
  @ApiBadRequestResponse({
    description:
      'Datos de la transacción inválidos',
  })
  @ApiInternalServerErrorResponse({
    description:
      'Error registrando la transacción',
  })
  create(
    @Body() dto: CreateTransactionDto,
  ) {
    return this.transactionsService.create(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Obtener transacciones',
    description:
      'Retorna todas las transacciones o permite filtrar por inversionista.',
  })
  @ApiQuery({
    name: 'user_id',
    required: false,
    enum: Investor,
    description:
      'Identificador del inversionista a consultar',
  })
  @ApiOkResponse({
    description:
      'Listado de transacciones obtenido correctamente',
  })
  @ApiBadRequestResponse({
    description:
      'Inversionista inválido',
  })
  @ApiInternalServerErrorResponse({
    description:
      'Error consultando las transacciones',
  })
  findAll(
    @Query('user_id')
    userId?: Investor,
  ) {
    return this.transactionsService.findAll(
      userId,
    );
  }
}