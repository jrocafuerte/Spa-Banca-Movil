import * as ScreenCapture from 'expo-screen-capture';
import { type ReactNode, useEffect, useRef, useState } from 'react';
import { AppState, Text, View } from 'react-native';
import { config, isProduction } from '../config';
import { useSession } from '../session/sessionStore';
import { checkDeviceIntegrity } from './integrity';
import { setupSslPinning } from './pinning';

/**
 * Controles transversales de seguridad del cliente:
 * - Integridad del dispositivo (root/jailbreak/hooking) y SSL pinning.
 * - Bloqueo de capturas/grabación de pantalla y difuminado en el app switcher.
 * - Cierre por inactividad y bloqueo tras permanecer en segundo plano.
 */
export function SecurityGate({ children }: { children: ReactNode }) {
  const [blocked, setBlocked] = useState<string>();
  const [ready, setReady] = useState(false);
  const backgroundAt = useRef<number | undefined>(undefined);

  useEffect(() => {
    (async () => {
      const integrity = await checkDeviceIntegrity();
      if (integrity.compromised && isProduction) {
        setBlocked('Por tu seguridad, la app no puede usarse en un dispositivo modificado.');
        return;
      }
      try {
        await setupSslPinning(() => setBlocked('Detectamos una conexión no segura. Intenta desde otra red.'));
      } catch {
        setBlocked('No pudimos establecer una conexión segura.');
        return;
      }
      if (isProduction) {
        await ScreenCapture.preventScreenCaptureAsync('global').catch(() => undefined);
      }
      await ScreenCapture.enableAppSwitcherProtectionAsync(0.9).catch(() => undefined);
      setReady(true);
    })();
  }, []);

  // Bloqueo por tiempo en segundo plano.
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'background') backgroundAt.current = Date.now();
      if (state === 'active' && backgroundAt.current) {
        const elapsed = Date.now() - backgroundAt.current;
        backgroundAt.current = undefined;
        if (elapsed > config.backgroundTimeoutMs && useSession.getState().status === 'signedIn')
          useSession.getState().lock();
      }
    });
    return () => sub.remove();
  }, []);

  // Cierre por inactividad.
  useEffect(() => {
    const timer = setInterval(() => {
      const s = useSession.getState();
      if (s.status === 'signedIn' && Date.now() - s.lastActivity > config.inactivityTimeoutMs) s.lock();
    }, 15_000);
    return () => clearInterval(timer);
  }, []);

  if (blocked) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 }}>
        <Text style={{ fontSize: 18, textAlign: 'center' }} accessibilityRole="alert">
          {blocked}
        </Text>
      </View>
    );
  }
  if (!ready) return null;
  return (
    <View style={{ flex: 1 }} onTouchStart={() => useSession.getState().touch()}>
      {children}
    </View>
  );
}
