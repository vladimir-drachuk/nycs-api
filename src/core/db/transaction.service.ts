import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { ClientSession, Connection } from 'mongoose';

@Injectable()
export class TransactionsService {
  constructor(@InjectConnection() private connection: Connection) {}

  async withTransactions<T>(
    session: ClientSession | undefined,
    cb: (session: ClientSession) => Promise<T>,
  ) {
    if (session) {
      return cb(session);
    }

    let result: T;

    const currentSession = await this.connection.startSession();

    try {
      await currentSession.withTransaction(async () => {
        result = await cb(currentSession);
      });
    } finally {
      currentSession.endSession();
    }

    return result;
  }
}
