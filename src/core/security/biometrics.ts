import * as LocalAuthentication from 'expo-local-authentication';

/**
 * Solo consulta capacidades. La confirmación de operaciones NO usa el
 * resultado booleano de `authenticateAsync` (evitable con hooking): se usa la
 * clave de firma protegida por biometría en Keychain/Keystore
 * (ver transactionSigning.ts).
 */
export async function biometricsAvailable(): Promise<boolean> {
  const [hw, enrolled] = await Promise.all([
    LocalAuthentication.hasHardwareAsync(),
    LocalAuthentication.isEnrolledAsync(),
  ]);
  return hw && enrolled;
}
