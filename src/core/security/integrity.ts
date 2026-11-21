import JailMonkey from 'jail-monkey';
import { isProduction } from '../config';

export interface IntegrityReport {
  compromised: boolean;
  reasons: string[];
}

/**
 * Chequeos RASP básicos en el cliente (MASVS-RESILIENCE). Son una barrera
 * más, no la única: la decisión de riesgo final se toma en el servidor con
 * atestación (Play Integrity API / App Attest) — ver docs/ROADMAP.md.
 */
export async function checkDeviceIntegrity(): Promise<IntegrityReport> {
  const reasons: string[] = [];
  try {
    if (JailMonkey.isJailBroken()) reasons.push('root/jailbreak');
    if (JailMonkey.hookDetected()) reasons.push('hooking');
    if (isProduction && (await JailMonkey.isDebuggedMode())) reasons.push('debugger');
  } catch {
    // Si el módulo nativo no está disponible (Expo Go / tests) solo se bloquea en producción.
    if (isProduction) reasons.push('integrity-check-unavailable');
  }
  return { compromised: reasons.length > 0, reasons };
}
