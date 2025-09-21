import { Stack } from 'expo-router';
import './global.css';

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'SignNGo' }} />
      <Stack.Screen name="signature" options={{ title: 'Create Signature' }} />
    </Stack>
  );
}