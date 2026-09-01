import {
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';

import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';

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
    example: 'Inversión de septiembre',
  })
  @IsOptional()
  @IsString()
  description?: string;
}