import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShadowVisible: false, headerBackButtonDisplayMode: 'minimal' }}>
      <Stack.Screen name="login" options={{ title: 'Ingresar', headerShown: false }} />
      <Stack.Screen name="otp" options={{ title: 'Verificación' }} />
    </Stack>
  );
}
