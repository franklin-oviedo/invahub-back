import {
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  createClient,
  SupabaseClient,
} from '@supabase/supabase-js';
import { randomUUID } from 'crypto';

import { UploadedFileDto } from '../transactions/dto/uploaded-file.dto';
import { StorageBucket } from '../transactions/enum/storage-bucket.enum';

@Injectable()
export class SupabaseService {
  private readonly client: SupabaseClient;

  constructor(
    private readonly configService: ConfigService,
  ) {
    const url =
      this.configService.get<string>(
        'SUPABASE_URL',
      );

    const key =
      this.configService.get<string>(
        'SUPABASE_SECRET_KEY',
      );

    if (!url || !key) {
      throw new Error(
        'Faltan las variables de entorno de Supabase',
      );
    }

    this.client = createClient(
      url,
      key,
    );
  }

  getClient(): SupabaseClient {
    return this.client;
  }

  async uploadVoucher(
    file: UploadedFileDto,
  ): Promise<string> {
    const extension =
      this.getFileExtension(
        file.originalname,
      );

    const fileName =
      `${randomUUID()}.${extension}`;

    const filePath =
      `transactions/${fileName}`;

    const { error } =
      await this.client.storage
        .from(StorageBucket.VOUCHERS)
        .upload(
          filePath,
          file.buffer,
          {
            contentType:
              file.mimetype,
            upsert: false,
          },
        );

    if (error) {
      throw new InternalServerErrorException(
        `Error subiendo comprobante: ${error.message}`,
      );
    }

    return filePath;
  }

  private getFileExtension(
    fileName: string,
  ): string {
    const parts =
      fileName.split('.');

    if (parts.length < 2) {
      return 'jpg';
    }

    return (
      parts.pop()?.toLowerCase() ??
      'jpg'
    );
  }
}