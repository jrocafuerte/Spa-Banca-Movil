import { Stack } from 'expo-router';

export default function PaymentsLayout() {
  return (
    <Stack screenOptions={{ headerShadowVisible: false, headerBackButtonDisplayMode: 'minimal' }}>
      <Stack.Screen name="index" options={{ title: 'Pagar' }} />
      <Stack.Screen name="card" options={{ title: 'Pagar tarjeta' }} />
      {/* El título lo controla el micro frontend vía SET_HEADER */}
      <Stack.Screen name="services" options={{ title: 'Pago de servicios', gestureEnabled: false }} />
    </Stack>
  );
}
