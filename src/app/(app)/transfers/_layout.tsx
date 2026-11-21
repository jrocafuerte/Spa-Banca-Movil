import { Stack } from 'expo-router';

export default function TransfersLayout() {
  return (
    <Stack screenOptions={{ headerShadowVisible: false, headerBackButtonDisplayMode: 'minimal' }}>
      <Stack.Screen name="index" options={{ title: 'Transferir' }} />
    </Stack>
  );
}
