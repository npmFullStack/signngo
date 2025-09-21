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
      <Stack.Screen name="loading" />
      <Stack.Screen name="index" />
      <Stack.Screen name="signature" />
      <Stack.Screen 
        name="track-order" 
        options={{
          headerShown: true,
          headerTitle: 'Track Order',
          headerTitleStyle: {
            fontFamily: 'Poppins-Bold',
            color: '#2563EB',
            textAlign: 'center',
            fontSize: 18,
          },
          headerBackTitle: 'Back',
        }}
      />
    </Stack>
  );
}