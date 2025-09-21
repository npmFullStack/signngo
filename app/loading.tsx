// app/loading.tsx
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect } from 'react';
import { router } from 'expo-router';
import GridBackground from '../components/GridBackground';

export default function LoadingScreen() {
  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/');
    }, 3000); // 3 seconds

    return () => clearTimeout(timer);
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="relative h-full w-full bg-white">
        <GridBackground />
        <View className="flex-1 justify-center items-center relative z-10">
          <Text className="font-poppins-bold text-4xl text-blue-600 text-center">
            Sign&Go
          </Text>
          <Text className="font-poppins text-sm text-slate-950 absolute bottom-10 text-center">
            POWERED BY XMFFI
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}