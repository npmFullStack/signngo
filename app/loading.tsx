import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoadingScreen() {
  return (
        <SafeAreaView className="flex-1 bg-gray-100">
    <View className="flex-1 justify-center items-center bg-blue-50">
      <Text className="font-prostoOne text-4xl text-blue-600 text-center">
        Sign&Go
      </Text>
      <Text className="font-poppins text-sm text-slate-950 absolute bottom-10 text-center">
        POWERED BY XMFFI
      </Text>
    </View>
        </SafeAreaView>
  );
}