import { Controller, Get, Post, Body } from '@nestjs/common';
import {
  ApiOperation,
  ApiOkResponse,
  ApiInternalServerErrorResponse,
} from '@nestjs/swagger';
import { ApiCreatedResponse, ApiBadRequestResponse } from '@nestjs/swagger';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { TransactionsService } from './transactions.service';

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  @ApiOperation({
    summary: 'Registrar una transacción',
    description: 'Registra una inversión o un retorno.',
  })
  @ApiCreatedResponse({
    description: 'Transacción registrada correctamente',
    type: CreateTransactionDto,
  })
  @ApiBadRequestResponse({
    description: 'Datos de la transacción inválidos',
  })
  @ApiInternalServerErrorResponse({
    description: 'Error registrando la transacción en Supabase',
  })
  create(@Body() createTransactionDto: CreateTransactionDto) {
    return this.transactionsService.create(createTransactionDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Obtener todas las transacciones',
  })
  @ApiOkResponse({
    description: 'Listado de transacciones',
    type: CreateTransactionDto,
    isArray: true,
  })
  @ApiInternalServerErrorResponse({
    description: 'Error consultando Supabase',
  })
  findAll() {
    return this.transactionsService.findAll();
  }
}
