import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  createClient,
  SupabaseClient,
} from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private readonly client: SupabaseClient;

  constructor(
    private readonly configService: ConfigService,
  ) {
    const url =
      this.configService.get<string>('SUPABASE_URL');

    const key =
      this.configService.get<string>(
        'SUPABASE_PUBLISHABLE_KEY',
      );

    if (!url || !key) {
      throw new Error(
        'Faltan las variables de entorno de Supabase',
      );
    }

    this.client = createClient(url, key);
  }

  getClient(): SupabaseClient {
    return this.client;
  }
}