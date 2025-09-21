import { View, Text, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';

export default function HomeScreen() {
  return (
    <View className="flex-1 justify-center items-center bg-gray-100 p-6">
      <Text className="text-3xl font-bold text-blue-600 mb-2">SignNGo</Text>
      <Text className="text-lg text-gray-600 mb-10 text-center">
        Capture and save your signatures easily
      </Text>
      
      <View className="w-full max-w-xs">
        <Link href="/signature" asChild>
          <TouchableOpacity className="bg-blue-500 py-4 rounded-lg mb-4">
            <Text className="text-white text-center font-semibold text-lg">
              Create New Signature
            </Text>
          </TouchableOpacity>
        </Link>
        
        <TouchableOpacity 
          className="bg-green-500 py-4 rounded-lg"
          onPress={() => alert('Gallery feature would go here')}
        >
          <Text className="text-white text-center font-semibold text-lg">
            View Saved Signatures
          </Text>
        </TouchableOpacity>
      </View>
      
      <View className="mt-16">
        <Text className="text-gray-500 text-center">
          Draw, save, and export your signatures with ease
        </Text>
      </View>
    </View>
  );
}