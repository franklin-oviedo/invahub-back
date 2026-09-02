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
  @IsOptional()
  @IsString()
  description?: string;
}