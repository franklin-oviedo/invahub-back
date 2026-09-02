import { ApiProperty } from '@nestjs/swagger';

export class UploadedFileDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Archivo del comprobante (JPG, PNG o WEBP)',
  })
  file!: any;

  @ApiProperty({
    example: 'comprobante-septiembre.jpg',
    required: false,
  })
  originalname!: string;

  @ApiProperty({
    example: 'image/jpeg',
    required: false,
  })
  mimetype!: string;

  @ApiProperty({
    example: 245760,
    description: 'Tamaño del archivo en bytes',
    required: false,
  })
  size!: number;

  buffer!: Buffer;
}