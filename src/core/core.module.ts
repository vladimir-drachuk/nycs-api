import { Module } from '@nestjs/common';
import { TransactionsService } from './db/transaction.service';

@Module({
  providers: [TransactionsService],
  exports: [TransactionsService],
})
export class CoreModule {}
