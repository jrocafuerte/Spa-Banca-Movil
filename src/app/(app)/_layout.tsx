import { Tabs } from 'expo-router';
import { useTheme } from '../../shared/ui/theme';

export default function AppLayout() {
  const t = useTheme();
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: t.primary, headerShadowVisible: false }}>
      <Tabs.Screen name="index" options={{ title: 'Inicio', headerTitle: 'Mi posición' }} />
      <Tabs.Screen name="transfers" options={{ title: 'Transferir', headerShown: false }} />
      <Tabs.Screen name="payments" options={{ title: 'Pagar', headerShown: false }} />
      <Tabs.Screen name="accounts/[id]" options={{ href: null, title: 'Movimientos' }} />
    </Tabs>
  );
}
