import * as SecureStore from 'expo-secure-store';

/**
 * Único lugar donde se persisten secretos: Keychain (iOS) / Keystore (Android).
 * Nunca usar AsyncStorage/MMKV sin cifrar para datos sensibles (MASVS-STORAGE-1).
 */
const KEYS = {
  refreshToken: 'bm.refresh_token',
  deviceId: 'bm.device_id',
  biometricEnabled: 'bm.biometric_enabled',
} as const;

const BASE: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY, // no migra a otro dispositivo ni a backups
};

export const secureStorage = {
  async getDeviceId() {
    return SecureStore.getItemAsync(KEYS.deviceId, BASE);
  },
  async setDeviceId(id: string) {
    await SecureStore.setItemAsync(KEYS.deviceId, id, BASE);
  },

  /** El refresh token queda protegido por biometría: leerlo exige Face ID / huella. */
  async saveRefreshToken(token: string, requireBiometrics: boolean) {
    await SecureStore.setItemAsync(KEYS.refreshToken, token, {
      ...BASE,
      requireAuthentication: requireBiometrics,
      authenticationPrompt: 'Confirma tu identidad para ingresar',
    });
    await SecureStore.setItemAsync(KEYS.biometricEnabled, requireBiometrics ? '1' : '0', BASE);
  },
  async readRefreshToken() {
    const bio = (await SecureStore.getItemAsync(KEYS.biometricEnabled, BASE)) === '1';
    return SecureStore.getItemAsync(KEYS.refreshToken, {
      ...BASE,
      requireAuthentication: bio,
      authenticationPrompt: 'Ingresa con tu biometría',
    });
  },
  async hasBiometricSession() {
    return (await SecureStore.getItemAsync(KEYS.biometricEnabled, BASE)) === '1';
  },
  async clearSession() {
    await SecureStore.deleteItemAsync(KEYS.refreshToken, BASE);
    await SecureStore.deleteItemAsync(KEYS.biometricEnabled, BASE);
  },
};
