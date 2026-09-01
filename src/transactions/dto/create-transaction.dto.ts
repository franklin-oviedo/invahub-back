import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Min,
} from 'class-validator';
import { TransactionType } from '../enum/transacitions.enum';

export class CreateTransactionDto {
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
    example: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  capital?: number;

  @ApiPropertyOptional({
    example: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  profit?: number;

  @ApiPropertyOptional({
    example: 'Inversión inicial',
  })
  @IsOptional()
  @IsString()
  description?: string;
}
