import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

import { SupabaseService } from '../supabase/supabase.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { Investor } from './enum/investor.enum';
import { InvestmentStatus } from './enum/investment-status.enum';
import { TransactionType } from './enum/transaction-type.enum';

@Injectable()
export class TransactionsService {
  constructor(
    private readonly supabaseService: SupabaseService,
  ) {}

  async create(dto: CreateTransactionDto) {
    if (
      dto.type ===
      TransactionType.INVESTMENT
    ) {
      return this.createInvestment(dto);
    }

    if (
      dto.type ===
      TransactionType.RETURN
    ) {
      return this.createReturn(dto);
    }

    throw new BadRequestException(
      'Tipo de transacción inválido',
    );
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

    const { data, error } =
      await query.order(
        'created_at',
        {
          ascending: false,
        },
      );

    if (error) {
      this.throwDatabaseError(
        error.message,
      );
    }

    return data ?? [];
  }

  async findPendingInvestments(
    investor: Investor,
  ) {
    const supabase =
      this.supabaseService.getClient();

    const { data, error } =
      await supabase
        .from('transactions')
        .select('*')
        .eq(
          'user_id',
          investor,
        )
        .eq(
          'type',
          TransactionType.INVESTMENT,
        )
        .order(
          'created_at',
          {
            ascending: false,
          },
        );

    if (error) {
      this.throwDatabaseError(
        error.message,
      );
    }

    const investments =
      await Promise.all(
        (data ?? []).map(
          async investment =>
            this.getInvestmentSummary(
              investment,
            ),
        ),
      );

    return investments.filter(
      investment =>
        investment.status !==
        InvestmentStatus.PAID,
    );
  }

  private async createInvestment(
    dto: CreateTransactionDto,
  ) {
    const supabase =
      this.supabaseService.getClient();

    const { data, error } =
      await supabase
        .from('transactions')
        .insert({
          user_id: dto.user_id,
          type:
            TransactionType.INVESTMENT,
          amount: dto.amount,
          capital: dto.amount,
          profit: 0,
          investment_id: null,
          description:
            dto.description?.trim() ||
            null,
        })
        .select()
        .single();

    if (error) {
      this.throwDatabaseError(
        error.message,
      );
    }

    return data;
  }

  private async createReturn(
    dto: CreateTransactionDto,
  ) {
    if (!dto.investment_id) {
      throw new BadRequestException(
        'Debes seleccionar una inversión',
      );
    }

    const investment =
      await this.findInvestment(
        dto.investment_id,
        dto.user_id,
      );

    const summary =
      await this.getInvestmentSummary(
        investment,
      );

    if (
      summary.status ===
      InvestmentStatus.PAID
    ) {
      throw new BadRequestException(
        'La inversión ya está saldada',
      );
    }

    const capital = Math.min(
      dto.amount,
      summary.pendingCapital,
    );

    const profit =
      dto.amount - capital;

    const supabase =
      this.supabaseService.getClient();

    const { data, error } =
      await supabase
        .from('transactions')
        .insert({
          user_id: dto.user_id,
          type:
            TransactionType.RETURN,
          amount: dto.amount,
          capital,
          profit,
          investment_id:
            investment.id,
          description:
            dto.description?.trim() ||
            null,
        })
        .select()
        .single();

    if (error) {
      this.throwDatabaseError(
        error.message,
      );
    }

    return {
      ...data,
      investment: {
        id: investment.id,
        originalAmount:
          Number(investment.amount),
        returnedCapital:
          summary.returnedCapital +
          capital,
        pendingCapital:
          Math.max(
            summary.pendingCapital -
              capital,
            0,
          ),
        status:
          summary.pendingCapital -
              capital <=
            0
            ? InvestmentStatus.PAID
            : InvestmentStatus.PARTIAL,
      },
    };
  }

  private async findInvestment(
    investmentId: string,
    investor: Investor,
  ) {
    const supabase =
      this.supabaseService.getClient();

    const { data, error } =
      await supabase
        .from('transactions')
        .select('*')
        .eq(
          'id',
          investmentId,
        )
        .eq(
          'user_id',
          investor,
        )
        .eq(
          'type',
          TransactionType.INVESTMENT,
        )
        .maybeSingle();

    if (error) {
      this.throwDatabaseError(
        error.message,
      );
    }

    if (!data) {
      throw new NotFoundException(
        'La inversión no existe o no pertenece al inversionista',
      );
    }

    return data;
  }

  private async getInvestmentSummary(
    investment: any,
  ) {
    const returnedCapital =
      await this.getReturnedCapital(
        investment.id,
      );

    const originalAmount =
      Number(investment.amount);

    const pendingCapital =
      Math.max(
        originalAmount -
          returnedCapital,
        0,
      );

    return {
      ...investment,
      originalAmount,
      returnedCapital,
      pendingCapital,
      status:
        this.getInvestmentStatus(
          originalAmount,
          returnedCapital,
        ),
    };
  }

  private async getReturnedCapital(
    investmentId: string,
  ): Promise<number> {
    const supabase =
      this.supabaseService.getClient();

    const { data, error } =
      await supabase
        .from('transactions')
        .select('capital')
        .eq(
          'investment_id',
          investmentId,
        )
        .eq(
          'type',
          TransactionType.RETURN,
        );

    if (error) {
      this.throwDatabaseError(
        error.message,
      );
    }

    return (data ?? []).reduce(
      (total, transaction) =>
        total +
        Number(
          transaction.capital,
        ),
      0,
    );
  }

  private getInvestmentStatus(
    originalAmount: number,
    returnedCapital: number,
  ): InvestmentStatus {
    if (
      returnedCapital >=
      originalAmount
    ) {
      return InvestmentStatus.PAID;
    }

    if (returnedCapital > 0) {
      return InvestmentStatus.PARTIAL;
    }

    return InvestmentStatus.PENDING;
  }

  private throwDatabaseError(
    message: string,
  ): never {
    throw new InternalServerErrorException(
      message,
    );
  }
}