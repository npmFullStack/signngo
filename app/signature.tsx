import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { Link } from 'expo-router';

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
    <View className="flex-1 bg-gray-100 p-6">
      <Text className="text-xl font-semibold text-center mb-6 text-gray-800">
        Draw your signature below
      </Text>
      
      {/* Signature area placeholder */}
      <View className="flex-1 bg-white border-2 border-dashed border-gray-300 rounded-lg mb-6 justify-center items-center">
        <Text className="text-gray-500 text-lg">Signature Area</Text>
        <Text className="text-gray-400 mt-2">(Draw your signature here)</Text>
      </View>
      
      <View className="flex-row justify-between mb-6">
        <Link href="/" asChild>
          <TouchableOpacity className="bg-gray-500 py-3 px-6 rounded-lg">
            <Text className="text-white font-semibold">Cancel</Text>
          </TouchableOpacity>
        </Link>
        
        <TouchableOpacity 
          className="bg-red-500 py-3 px-6 rounded-lg"
          onPress={() => Alert.alert("Clear", "Signature cleared")}
        >
          <Text className="text-white font-semibold">Clear</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          className="bg-blue-500 py-3 px-6 rounded-lg"
          onPress={simulateSignatureCapture}
        >
          <Text className="text-white font-semibold">Save</Text>
        </TouchableOpacity>
      </View>
      
      <View className="bg-blue-50 p-4 rounded-lg">
        <Text className="text-blue-800 text-center">
          Tip: Use your finger to draw your signature in the area above
        </Text>
      </View>
    </View>
  );
}