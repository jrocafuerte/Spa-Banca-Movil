import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ApiError } from '../core/api/http';
import { SecurityGate } from '../core/security/SecurityGate';
import { secureStorage } from '../core/security/secureStorage';
import { useSession } from '../core/session/sessionStore';
import { Loading, UiProvider } from '../shared/ui';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (count, err) => !(err instanceof ApiError && err.status >= 400 && err.status < 500) && count < 2,
      gcTime: 5 * 60 * 1000,
    },
    mutations: { retry: false }, // las operaciones monetarias nunca se reintentan automáticamente
  },
});

export default function RootLayout() {
  const status = useSession((s) => s.status);

  useEffect(() => {
    // Al arrancar: si existe sesión biométrica se pide desbloqueo; si no, login.
    // Si el almacenamiento seguro falla (Keychain/Keystore no disponible), se cae a login: nunca queda trabada.
    secureStorage
      .hasBiometricSession()
      .catch(() => false)
      .then((bio) => {
        if (useSession.getState().status === 'unknown') useSession.setState({ status: bio ? 'locked' : 'signedOut' });
      });
  }, []);

  // Redirección explícita según la sesión (incluye la ruta inicial "/" y deep links a pantallas privadas).
  const segments = useSegments();
  const router = useRouter();
  useEffect(() => {
    if (status === 'unknown') return;
    const inAuthGroup = segments[0] === '(auth)';
    // `segments.length < 2`: el grupo (auth) sin pantalla concreta (p. ej. tras cerrar sesión).
    if (status !== 'signedIn' && (!inAuthGroup || segments.length < 2)) router.replace('/login');
    else if (status === 'signedIn' && inAuthGroup) router.replace('/');
  }, [status, segments, router]);

  // Al cerrar o bloquear sesión se purga la caché de datos financieros en memoria.
  useEffect(() => {
    if (status !== 'signedIn') queryClient.clear();
  }, [status]);

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <UiProvider>
          <SecurityGate>
            <StatusBar style="auto" />
            {/* Mientras se determina la sesión ningún grupo de rutas está habilitado: pantalla de carga. */}
            {status === 'unknown' ? (
              <Loading />
            ) : (
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Protected guard={status === 'signedIn'}>
                  <Stack.Screen name="(app)" />
                </Stack.Protected>
                <Stack.Protected guard={status !== 'signedIn'}>
                  <Stack.Screen name="(auth)" />
                </Stack.Protected>
              </Stack>
            )}
          </SecurityGate>
        </UiProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
