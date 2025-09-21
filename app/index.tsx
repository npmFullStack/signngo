import { View, Text, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import NavigationBar from '../components/NavigationBar';
import GridBackground from '../components/GridBackground';

export default function HomeScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="relative h-full w-full bg-white">
        <GridBackground />
        
        <View className="flex-1 justify-center items-center p-6 relative z-10">
          <Text className="text-4xl font-poppins-bold text-blue-600 mb-8">Sign&Go</Text>
          
          <Text className="text-xl font-poppins text-gray-800 mb-8 text-center">
            Ready to track your deliveries?
          </Text>
          
          <Link href="/track-order" asChild>
            <TouchableOpacity className="bg-blue-600 py-4 px-8 rounded-lg">
              <Text className="text-white text-center font-poppins-bold text-lg">
                Get Started
              </Text>
            </TouchableOpacity>
          </Link>
        </View>
        
        <NavigationBar activeTab="home" />
      </View>
    </SafeAreaView>
  );
}