// app/signature.tsx
import { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import GridBackground from '../components/GridBackground';
import NavigationBar from '../components/NavigationBar';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import SignatureCanvas from 'react-native-signature-canvas';
import { useBookingStore } from '../store/bookingStore';

export default function SignatureScreen() {
  const router = useRouter();
  const { currentBooking, updateBookingStatus, loading } = useBookingStore();
  const [signature, setSignature] = useState<string | null>(null);
  const sigRef = useRef<any>(null);

  const handleOK = (sig: string) => {
    setSignature(sig); // base64 signature string
  };

  const handleSaveSignature = async () => {
    if (!currentBooking) {
      Alert.alert("Error", "No booking loaded.");
      return;
    }

    // Ask signature pad to output base64 → triggers onOK
    sigRef.current?.readSignature();

    if (!signature) {
      Alert.alert("Error", "Please draw your signature first.");
      return;
    }

    let nextStatus: string | null = null;
    switch (currentBooking.status) {
      case 'PICKUP_SCHEDULED':
        nextStatus = 'LOADED_TO_TRUCK';
        break;
      case 'LOADED_TO_TRUCK':
        nextStatus = 'ARRIVED_ORIGIN_PORT';
        break;
      case 'ARRIVED_DESTINATION_PORT':
        nextStatus = 'OUT_FOR_DELIVERY';
        break;
      case 'OUT_FOR_DELIVERY':
        nextStatus = 'DELIVERED';
        break;
      default:
        nextStatus = null;
    }

    if (!nextStatus) {
      Alert.alert("Info", "No further action required for this booking.");
      return;
    }

    const success = await updateBookingStatus(currentBooking.id, nextStatus);
    if (success) {
      Alert.alert("Signature Captured", `Status updated to ${nextStatus.replace(/_/g, " ")}`, [
        { text: "OK", onPress: () => router.back() }
      ]);
    }
  };

  const handleRetry = () => {
    sigRef.current?.clearSignature();
    setSignature(null);
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <GridBackground />
      <View className="flex-1 relative z-10 p-6">
        {/* Title */}
        <Text className="text-xl font-poppins-bold text-center mb-4 text-gray-800">
          Draw your signature
        </Text>

        {/* Signature Box */}
        <View className="flex-1 bg-gray-50 border border-gray-300 rounded-xl mb-6 overflow-hidden relative shadow-sm">
          {/* Retry button top-right */}
          <TouchableOpacity
            onPress={handleRetry}
            className="absolute top-2 right-2 z-10 bg-white px-2 py-1 rounded-md shadow"
          >
            <Icon name="reload" size={20} color="#2563EB" />
          </TouchableOpacity>

          <SignatureCanvas
            ref={sigRef}
            onOK={handleOK}
            descriptionText=""
            clearText="Clear"
            confirmText="Save"
            webStyle={`
              .m-signature-pad { box-shadow: none; border: none; }
              .m-signature-pad--body { border: none; }
              .m-signature-pad--footer { display: none; }
            `}
          />

          {/* Label bottom */}
          <View className="absolute bottom-0 left-0 right-0 bg-gray-100 py-1 border-t border-gray-200">
            <Text className="text-center text-gray-600 font-poppins text-xs">
              Signature Area
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View className="flex-row justify-center space-x-4 mb-6">
          <TouchableOpacity
            className="bg-gray-500 py-3 px-6 rounded-lg flex-1 items-center"
            onPress={() => router.back()}
          >
            <Text className="text-white font-poppins-bold">Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-blue-500 py-3 px-6 rounded-lg flex-1 items-center"
            onPress={handleSaveSignature}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text className="text-white font-poppins-bold">Save</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Bottom Navigation */}
        <NavigationBar activeTab="signature" />
      </View>
    </SafeAreaView>
  );
}
