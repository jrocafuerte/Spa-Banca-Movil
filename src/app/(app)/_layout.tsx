import { Tabs } from 'expo-router';
import { Icon } from '../../shared/ui';
import { useTabOptions } from '../../shared/ui/navigation';

export default function AppLayout() {
  const tabOptions = useTabOptions();
  return (
    <Tabs screenOptions={tabOptions}>
      <Tabs.Screen
        name="(home)"
        options={{
          tabBarIcon: ({ color, size }) => <Icon name="home" color={color} size={size} />,
          title: 'Inicio',
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="transfers"
        options={{
          tabBarIcon: ({ color, size }) => <Icon name="transfer" color={color} size={size} />,
          title: 'Transferir',
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="payments"
        options={{
          tabBarIcon: ({ color, size }) => <Icon name="pay" color={color} size={size} />,
          title: 'Pagar',
          headerShown: false,
        }}
      />
    </Tabs>
  );
}
