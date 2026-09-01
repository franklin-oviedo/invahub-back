import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';

import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class TransactionsService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async create(createTransactionDto: CreateTransactionDto) {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('transactions')
      .insert({
        user_id: 'TEMP_USER',
        type: createTransactionDto.type,
        amount: createTransactionDto.amount,
        capital: createTransactionDto.capital ?? 0,
        profit: createTransactionDto.profit ?? 0,
        description: createTransactionDto.description ?? null,
      })
      .select()
      .single();

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    return data;
  }

  async findAll() {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('created_at', {
        ascending: false,
      });

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    return data;
  }
}
