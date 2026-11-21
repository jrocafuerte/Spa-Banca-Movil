import { Stack } from 'expo-router';
import { useHeaderOptions } from '../../../shared/ui/navigation';

export default function TransfersLayout() {
  const headerOptions = useHeaderOptions();
  return (
    <Stack screenOptions={headerOptions}>
      <Stack.Screen name="index" options={{ title: 'Transferir' }} />
    </Stack>
  );
}
