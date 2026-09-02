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
    private readonly transactionsService:
      TransactionsService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Registrar una transacción',
    description:
      'Registra una inversión o retorno. En los retornos, el backend calcula automáticamente capital, ganancia y saldo pendiente de la inversión seleccionada.',
  })
  @ApiCreatedResponse({
    description:
      'Transacción registrada correctamente',
  })
  @ApiBadRequestResponse({
    description:
      'Datos inválidos, inversión no seleccionada o inversión ya saldada',
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

  @Get('investments/pending')
  @ApiOperation({
    summary:
      'Obtener inversiones pendientes',
    description:
      'Retorna las inversiones que todavía tienen capital pendiente para un inversionista.',
  })
  @ApiQuery({
    name: 'user_id',
    required: true,
    enum: Investor,
    description:
      'Identificador del inversionista',
  })
  @ApiOkResponse({
    description:
      'Listado de inversiones pendientes obtenido correctamente',
  })
  @ApiBadRequestResponse({
    description:
      'Inversionista inválido o no especificado',
  })
  @ApiInternalServerErrorResponse({
    description:
      'Error consultando las inversiones pendientes',
  })
  findPendingInvestments(
    @Query('user_id')
    userId: Investor,
  ) {
    return this.transactionsService
      .findPendingInvestments(userId);
  }
}