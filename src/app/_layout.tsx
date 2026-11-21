import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ApiError } from '../core/api/http';
import { SecurityGate } from '../core/security/SecurityGate';
import { secureStorage } from '../core/security/secureStorage';
import { useSession } from '../core/session/sessionStore';
import { UiProvider } from '../shared/ui';

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
    secureStorage.hasBiometricSession().then((bio) => {
      if (useSession.getState().status === 'unknown') useSession.setState({ status: bio ? 'locked' : 'signedOut' });
    });
  }, []);

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
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Protected guard={status === 'signedIn'}>
                <Stack.Screen name="(app)" />
              </Stack.Protected>
              <Stack.Protected guard={status !== 'signedIn'}>
                <Stack.Screen name="(auth)" />
              </Stack.Protected>
            </Stack>
          </SecurityGate>
        </UiProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
