import { Stack } from 'expo-router';
import { useHeaderOptions } from '../../../shared/ui/navigation';

export default function PaymentsLayout() {
  const headerOptions = useHeaderOptions();
  return (
    <Stack screenOptions={headerOptions}>
      <Stack.Screen name="index" options={{ title: 'Pagar' }} />
      <Stack.Screen name="card" options={{ title: 'Pagar tarjeta' }} />
      {/* El título lo controla el micro frontend vía SET_HEADER */}
      <Stack.Screen name="services" options={{ title: 'Pago de servicios', gestureEnabled: false }} />
    </Stack>
  );
}
