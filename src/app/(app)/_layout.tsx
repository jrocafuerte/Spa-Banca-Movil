import { Tabs } from 'expo-router';
import { useTabOptions } from '../../shared/ui/navigation';

export default function AppLayout() {
  const tabOptions = useTabOptions();
  return (
    <Tabs screenOptions={tabOptions}>
      <Tabs.Screen name="index" options={{ title: 'Inicio', headerTitle: 'Mi posición' }} />
      <Tabs.Screen name="transfers" options={{ title: 'Transferir', headerShown: false }} />
      <Tabs.Screen name="payments" options={{ title: 'Pagar', headerShown: false }} />
      <Tabs.Screen name="accounts/[id]" options={{ href: null, title: 'Movimientos' }} />
    </Tabs>
  );
}
