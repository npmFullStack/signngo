// app/signature.tsx
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import NavigationBar from '../components/NavigationBar';
import GridBackground from '../components/GridBackground';

export default function SignatureScreen() {
  const simulateSignatureCapture = () => {
    Alert.alert(
      "Signature Captured",
      "Your signature was successfully captured!",
      [
        {
          text: "OK",
        }
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="relative h-full w-full bg-white">
        <GridBackground />
        
        <View className="flex-1 p-6 relative z-10">
          <Text className="text-xl font-poppins-bold text-center mb-6 text-gray-800">
            Draw your signature below
          </Text>
          
          {/* Signature area placeholder */}
          <View className="flex-1 bg-white border-2 border-dashed border-gray-300 rounded-lg mb-6 justify-center items-center">
            <Text className="text-gray-500 text-lg font-poppins">Signature Area</Text>
            <Text className="text-gray-400 mt-2 font-poppins">(Draw your signature here)</Text>
          </View>
          
          <View className="flex-row justify-between mb-6">
            <Link href="/" asChild>
              <TouchableOpacity className="bg-gray-500 py-3 px-6 rounded-lg">
                <Text className="text-white font-poppins-bold">Cancel</Text>
              </TouchableOpacity>
            </Link>
            <TouchableOpacity
              className="bg-red-500 py-3 px-6 rounded-lg"
              onPress={() => Alert.alert("Clear", "Signature cleared")}
            >
              <Text className="text-white font-poppins-bold">Clear</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="bg-blue-500 py-3 px-6 rounded-lg"
              onPress={simulateSignatureCapture}
            >
              <Text className="text-white font-poppins-bold">Save</Text>
            </TouchableOpacity>
          </View>
          
          <View className="bg-blue-50 p-4 rounded-lg">
            <Text className="text-blue-800 text-center font-poppins">
              Tip: Use your finger to draw your signature in the area above
            </Text>
          </View>
        </View>
        
        {/* Navigation Bar */}
        <NavigationBar activeTab="signature" />
      </View>
    </SafeAreaView>
  );
}