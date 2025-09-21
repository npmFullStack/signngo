import { Stack } from 'expo-router';
import '../styles/global.css';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    'Poppins-Regular': require('../assets/fonts/Poppins-Regular.ttf'),
    'Poppins-Bold': require('../assets/fonts/Poppins-Bold.ttf'),
    'ProstoOne-Regular': require('../assets/fonts/ProstoOne-Regular.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      setTimeout(() => {
        SplashScreen.hideAsync();
      }, 100);
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="loading" options={{ headerShown: false }} />
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="signature" options={{ headerShown: false }} />
      <Stack.Screen name="report-incident" options={{ headerShown: false }} />
      <Stack.Screen
        name="track-order"
        options={{
          headerShown: true,
          headerTitle: 'Track Order',
          headerTitleAlign: 'center',
          headerTitleStyle: {
            fontFamily: 'Poppins-Bold',
            color: '#2563EB',
            fontSize: 18,
          },
          headerBackTitle: 'Back',
        }}
      />
    </Stack>
  );
}