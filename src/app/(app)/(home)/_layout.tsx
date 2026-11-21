import { Stack } from 'expo-router';
import { useHeaderOptions } from '../../../shared/ui/navigation';

export default function HomeLayout() {
  const headerOptions = useHeaderOptions();
  return (
    <Stack screenOptions={headerOptions}>
      <Stack.Screen name="index" options={{ title: 'Mi posición' }} />
      <Stack.Screen name="accounts/[id]" options={{ title: 'Movimientos' }} />
    </Stack>
  );
}
