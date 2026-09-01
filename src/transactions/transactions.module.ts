import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { SupabaseService } from '../supabase/supabase.service';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';

@Module({
  imports: [
    ConfigModule,
  ],
  controllers: [
    TransactionsController,
  ],
  providers: [
    TransactionsService,
    SupabaseService,
  ],
})
export class TransactionsModule {}