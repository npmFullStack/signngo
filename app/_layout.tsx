import { Stack } from 'expo-router';
import './global.css';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { View } from 'react-native';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    'Poppins-Regular': require('../assets/fonts/Poppins-Regular.ttf'),
    'Poppins-Bold': require('../assets/fonts/Poppins-Bold.ttf'),
    'ProstoOne-Regular': require('../assets/fonts/ProstoOne-Regular.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      // Hide splash screen after a short delay to ensure loading screen is visible
      setTimeout(() => {
        SplashScreen.hideAsync();
      }, 100);
    }
  }, [fontsLoaded, fontError]);

  // Return null while fonts are loading - Expo Router will show loading.tsx
  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <Stack>
      <Stack.Screen
        name="loading"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="signature"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}