import {
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';

import { SupabaseService } from '../supabase/supabase.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { Investor } from './enum/investor.enum';
import { TransactionType } from './enum/transaction-type.enum';

@Injectable()
export class TransactionsService {
  constructor(
    private readonly supabaseService: SupabaseService,
  ) {}

  async create(dto: CreateTransactionDto) {
    const supabase =
      this.supabaseService.getClient();

    const { capital, profit } =
      await this.calculateAmounts(dto);

    const { data, error } = await supabase
      .from('transactions')
      .insert({
        user_id: dto.user_id,
        type: dto.type,
        amount: dto.amount,
        capital,
        profit,
        description:
          dto.description?.trim() || null,
      })
      .select()
      .single();

    if (error) {
      this.throwDatabaseError(error.message);
    }

    return data;
  }

  async findAll(userId?: Investor) {
    const supabase =
      this.supabaseService.getClient();

    let query = supabase
      .from('transactions')
      .select('*');

    if (userId) {
      query = query.eq(
        'user_id',
        userId,
      );
    }

    const { data, error } = await query.order(
      'created_at',
      {
        ascending: false,
      },
    );

    if (error) {
      this.throwDatabaseError(error.message);
    }

    return data ?? [];
  }

  private async calculateAmounts(
    dto: CreateTransactionDto,
  ): Promise<{
    capital: number;
    profit: number;
  }> {
    if (
      dto.type ===
      TransactionType.INVESTMENT
    ) {
      return {
        capital: dto.amount,
        profit: 0,
      };
    }

    const pendingCapital =
      await this.getPendingCapital(
        dto.user_id,
      );

    const capital = Math.min(
      dto.amount,
      pendingCapital,
    );

    return {
      capital,
      profit: dto.amount - capital,
    };
  }

  private async getPendingCapital(
    investor: Investor,
  ): Promise<number> {
    const supabase =
      this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('transactions')
      .select('type, amount, capital')
      .eq('user_id', investor);

    if (error) {
      this.throwDatabaseError(error.message);
    }

    const summary = (data ?? []).reduce(
      (acc, transaction) => {
        if (
          transaction.type ===
          TransactionType.INVESTMENT
        ) {
          acc.invested += Number(
            transaction.amount,
          );
        }

        if (
          transaction.type ===
          TransactionType.RETURN
        ) {
          acc.returned += Number(
            transaction.capital,
          );
        }

        return acc;
      },
      {
        invested: 0,
        returned: 0,
      },
    );

    return Math.max(
      summary.invested -
        summary.returned,
      0,
    );
  }

  private throwDatabaseError(
    message: string,
  ): never {
    throw new InternalServerErrorException(
      message,
    );
  }
}