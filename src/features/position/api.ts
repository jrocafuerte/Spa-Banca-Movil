import { useQuery } from '@tanstack/react-query';
import { http } from '../../core/api/http';

export type Currency = 'USD' | 'PEN' | 'COP' | 'MXN';

export interface Position {
  totals: Partial<Record<Currency, number>>;
  accounts: {
    id: string;
    type: 'SAVINGS' | 'CHECKING';
    currency: Currency;
    numberMasked: string;
    availableBalance: number;
    ledgerBalance: number;
  }[];
  cards: {
    id: string;
    brand: 'VISA' | 'MASTERCARD';
    panMasked: string;
    currency: Currency;
    creditLimit: number;
    availableCredit: number;
    statementBalance: number;
    minimumPayment: number;
    dueDate: string;
  }[];
  loans: {
    id: string;
    product: string;
    currency: Currency;
    outstandingPrincipal: number;
    nextInstallment: number;
    nextDueDate: string;
  }[];
}

export interface Movement {
  id: string;
  date: string;
  description: string;
  amount: number;
  currency: Currency;
}

export const positionKeys = { all: ['position'] as const, movements: (id: string) => ['movements', id] as const };

export const usePosition = () =>
  useQuery({ queryKey: positionKeys.all, queryFn: () => http<Position>('/v1/position'), staleTime: 30_000 });

export const useMovements = (accountId: string) =>
  useQuery({
    queryKey: positionKeys.movements(accountId),
    queryFn: () => http<{ items: Movement[] }>(`/v1/accounts/${encodeURIComponent(accountId)}/movements?limit=20`),
  });

export { formatMoney } from '../../shared/format';
