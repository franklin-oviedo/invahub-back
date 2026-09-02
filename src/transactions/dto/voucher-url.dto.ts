import {
  ApiProperty,
} from '@nestjs/swagger';

export class VoucherUrlDto {
  @ApiProperty({
    example:
      'https://xxxxx.supabase.co/storage/v1/object/sign/vouchers/archivo.png',
  })
  url!: string;
}