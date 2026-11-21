import { http } from '../../core/api/http';
import type { Currency } from '../position/api';

export type AmountType = 'MINIMUM' | 'TOTAL' | 'OTHER';

export interface CardPaymentResult {
  status: 'COMPLETED';
  card: string;
  amount: number;
  currency: Currency;
  operationId: string;
  executedAt: string;
}

export const cardPaymentsApi = {
  pay: (
    input: { cardId: string; fromAccountId: string; amountType: AmountType; amount?: number; signature?: string },
    idempotencyKey: string,
  ) => http<CardPaymentResult>('/v1/card-payments', { method: 'POST', body: input, idempotencyKey }),
};
