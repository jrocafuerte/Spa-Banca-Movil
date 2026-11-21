import { z } from 'zod';
import { http, newIdempotencyKey } from '../../core/api/http';
import type { Currency } from '../position/api';

/** Validación en cliente = UX. La validación autoritativa siempre está en el BFF. */
export const TransferFormSchema = z
  .object({
    type: z.enum(['OWN', 'THIRD_PARTY', 'INTERBANK']),
    fromAccountId: z.string().min(1, 'Selecciona la cuenta de origen'),
    toAccountNumber: z.string().regex(/^\d{10,20}$/, 'Número de cuenta inválido'),
    bankCode: z
      .string()
      .regex(/^\d{3,4}$/, 'Código de banco inválido')
      .optional(),
    amount: z.coerce
      .number({ message: 'Monto inválido' })
      .positive('Monto inválido')
      .max(50_000, 'Supera el límite por operación'),
    currency: z.enum(['USD', 'PEN', 'COP', 'MXN']),
    description: z
      .string()
      .max(60)
      .regex(/^[\p{L}\p{N} .,\-#]*$/u, 'Caracteres no permitidos')
      .default(''),
  })
  .refine((t) => t.type !== 'INTERBANK' || !!t.bankCode, { message: 'Código de banco requerido', path: ['bankCode'] });

export type TransferForm = z.infer<typeof TransferFormSchema>;

export interface PreparedTransfer {
  transferId: string;
  summary: { from: string; to: string; beneficiary: string; amount: number; currency: Currency; fee: number };
  otpRequired: boolean;
  challengeId?: string;
  expiresIn: number;
}

export interface TransferResult {
  transferId: string;
  status: 'COMPLETED';
  operationId: string;
  executedAt: string;
}

export const transfersApi = {
  prepare: (form: TransferForm) => http<PreparedTransfer>('/v1/transfers/prepare', { method: 'POST', body: form }),
  confirm: (transferId: string, auth: { otp?: string; signature?: string }, idempotencyKey = newIdempotencyKey()) =>
    http<TransferResult>(`/v1/transfers/${encodeURIComponent(transferId)}/confirm`, {
      method: 'POST',
      body: auth,
      idempotencyKey,
    }),
};
