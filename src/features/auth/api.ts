import { http } from '../../core/api/http';
import { getDeviceId } from '../../core/security/deviceId';
import { secureStorage } from '../../core/security/secureStorage';
import { transactionSigning } from '../../core/security/transactionSigning';
import { useSession } from '../../core/session/sessionStore';

export interface LoginChallenge {
  mfaRequired: true;
  channel: 'SMS';
  destination: string;
  challengeId: string;
  expiresIn: number;
}

interface Tokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  customer?: { name: string };
}

export const authApi = {
  async login(documentId: string, password: string): Promise<LoginChallenge> {
    return http<LoginChallenge>('/v1/auth/login', {
      method: 'POST',
      auth: false,
      body: { documentId, password, deviceId: await getDeviceId() },
    });
  },

  async verifyOtp(challengeId: string, otp: string, enableBiometrics: boolean): Promise<void> {
    const t = await http<Tokens>('/v1/auth/mfa/verify', {
      method: 'POST',
      auth: false,
      body: { challengeId, otp, deviceId: await getDeviceId() },
    });
    await secureStorage.saveRefreshToken(t.refreshToken, enableBiometrics);
    useSession.getState().signIn(t.accessToken, t.customer?.name);
    if (enableBiometrics) {
      // Registro de la clave de firma de transacciones (solo permitido en sesión recién autenticada con MFA).
      const key = await transactionSigning.enroll().catch(() => undefined);
      if (key) await http<void>('/v1/devices/signing-key', { method: 'POST', body: { key } }).catch(() => undefined);
    }
  },

  /** Desbloqueo con biometría: leer el refresh token dispara Face ID / huella. */
  async unlockWithBiometrics(): Promise<boolean> {
    const refreshToken = await secureStorage.readRefreshToken().catch(() => null);
    if (!refreshToken) return false;
    try {
      const t = await http<Tokens>('/v1/auth/refresh', {
        method: 'POST',
        auth: false,
        body: { refreshToken, deviceId: await getDeviceId() },
      });
      await secureStorage.saveRefreshToken(t.refreshToken, true);
      useSession.getState().signIn(t.accessToken);
      return true;
    } catch {
      await secureStorage.clearSession();
      return false;
    }
  },

  async logout(): Promise<void> {
    await http<void>('/v1/auth/logout', { method: 'POST' }).catch(() => undefined);
    await secureStorage.clearSession();
    await transactionSigning.clear().catch(() => undefined);
    useSession.getState().signOut();
  },
};
