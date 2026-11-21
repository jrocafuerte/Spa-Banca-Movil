import { Stack } from 'expo-router';
import { useHeaderOptions } from '../../shared/ui/navigation';

export default function AuthLayout() {
  const headerOptions = useHeaderOptions();
  return (
    <Stack screenOptions={headerOptions}>
      <Stack.Screen name="login" options={{ title: 'Ingresar', headerShown: false }} />
      <Stack.Screen name="otp" options={{ title: 'Verificación' }} />
    </Stack>
  );
}
