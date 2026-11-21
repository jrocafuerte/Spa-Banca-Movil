import { http } from '../../core/api/http';

export const servicePaymentsApi = {
  /** Token de un solo uso (60 s) para abrir sesión en el micro frontend de recaudos. */
  handoff: () =>
    http<{ handoffToken: string; expiresIn: number }>('/v1/microfrontends/recaudos/handoff', { method: 'POST' }),

  /**
   * Token ligado a la transacción. `signature` = HMAC del mensaje canónico con la
   * clave del dispositivo protegida por biometría (verificada por el BFF).
   */
  stepUp: (input: { intentHash: string; amount: number; currency: string; signature?: string }) =>
    http<{ stepUpToken: string; expiresIn: number }>('/v1/microfrontends/recaudos/step-up', {
      method: 'POST',
      body: input,
    }),
};
