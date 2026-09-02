import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';

import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UploadedFileDto } from './dto/uploaded-file.dto';
import { VoucherUrlDto } from './dto/voucher-url.dto';
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
  @UseInterceptors(
    FileInterceptor(
      'voucher',
      {
        limits: {
          fileSize:
            5 * 1024 * 1024,
        },
        fileFilter: (
          request,
          file,
          callback,
        ) => {
          const allowedMimeTypes = [
            'image/jpeg',
            'image/png',
            'image/webp',
            'application/pdf',
          ];

          if (
            !allowedMimeTypes.includes(
              file.mimetype,
            )
          ) {
            return callback(
              new BadRequestException(
                'Formato de comprobante no permitido. Solo se aceptan JPG, JPEG, PNG, WEBP y PDF.',
              ),
              false,
            );
          }

          callback(
            null,
            true,
          );
        },
      },
    ),
  )
  @ApiConsumes(
    'multipart/form-data',
  )
  @ApiBody({
    type: CreateTransactionDto,
  })
  @ApiOperation({
    summary:
      'Registrar una transacción',
    description:
      'Registra una inversión o retorno. Permite adjuntar un comprobante de hasta 5 MB en formato JPG, JPEG, PNG, WEBP o PDF. En los retornos, el backend calcula automáticamente capital, ganancia y saldo pendiente de la inversión seleccionada.',
  })
  @ApiCreatedResponse({
    description:
      'Transacción registrada correctamente',
  })
  @ApiBadRequestResponse({
    description:
      'Datos inválidos, comprobante no permitido, inversión no seleccionada o inversión ya saldada',
  })
  @ApiInternalServerErrorResponse({
    description:
      'Error registrando la transacción o subiendo el comprobante',
  })
  create(
    @Body()
    dto: CreateTransactionDto,
    @UploadedFile()
    voucher: UploadedFileDto,
  ) {
    return this.transactionsService.create(
      dto,
      voucher,
    );
  }

  @Get()
  @ApiOperation({
    summary:
      'Obtener transacciones',
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
      .findPendingInvestments(
        userId,
      );
  }

  @Get(':id/voucher')
  @ApiOperation({
    summary:
      'Obtener comprobante de una transacción',
    description:
      'Genera una URL temporal para visualizar el comprobante asociado a una transacción.',
  })
  @ApiOkResponse({
    description:
      'URL temporal del comprobante generada correctamente',
    type: VoucherUrlDto,
  })
  @ApiNotFoundResponse({
    description:
      'Movimiento no encontrado o sin comprobante',
  })
  @ApiBadRequestResponse({
    description:
      'Identificador de transacción inválido',
  })
  @ApiInternalServerErrorResponse({
    description:
      'Error generando la URL del comprobante',
  })
  getVoucherUrl(
    @Param(
      'id',
      new ParseUUIDPipe(),
    )
    id: string,
  ): Promise<VoucherUrlDto> {
    return this.transactionsService
      .getVoucherUrl(id);
  }
}