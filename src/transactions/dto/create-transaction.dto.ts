import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
} from 'class-validator';
import {
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';
import { Type } from 'class-transformer';

import { Investor } from '../enum/investor.enum';
import { TransactionType } from '../enum/transaction-type.enum';

export class CreateTransactionDto {
  @ApiProperty({
    enum: Investor,
    example: Investor.OTNIEL_OVIEDO,
  })
  @IsEnum(Investor)
  user_id!: Investor;

  @ApiProperty({
    enum: TransactionType,
    example: TransactionType.INVESTMENT,
  })
  @IsEnum(TransactionType)
  type!: TransactionType;

  @ApiProperty({
    example: 35000,
  })
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  amount!: number;

  @ApiPropertyOptional({
    description:
      'ID de la inversión asociada. Obligatorio para retornos.',
  })
  @IsOptional()
  @IsUUID()
  investment_id?: string;

  @ApiPropertyOptional({
    example: 'Movimiento de septiembre',
  })
  @IsString()
  description!: string;

  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description:
      'Comprobante de la transacción',
  })
  @IsOptional()
  voucher!: any;
}