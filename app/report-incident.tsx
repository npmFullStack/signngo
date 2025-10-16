// app/report-incident.tsx
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image, Alert } from 'react-native';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { useRouter } from 'expo-router';
import GridBackground from '../components/GridBackground';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import NavigationBar from '../components/NavigationBar';
import { useBookingStore } from '../store/bookingStore';

export default function ReportIncidentScreen() {
  const router = useRouter();
  const { currentBooking } = useBookingStore();
  const [description, setDescription] = useState('');
  const [totalCost, setTotalCost] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });
    if (!result.canceled) setImage(result.assets[0].uri);
  };

  const handleSubmit = async () => {
    if (!description.trim()) {
      Alert.alert('Error', 'Please describe the incident.');
      return;
    }

    if (!currentBooking) {
      Alert.alert('Error', 'No active booking found.');
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('type', 'LAND');
      formData.append('description', description);
      formData.append('bookingId', currentBooking.id);
      formData.append('totalCost', totalCost || '0');

      if (image) {
        const filename = image.split('/').pop();
        const match = /\.(\w+)$/.exec(filename!);
        const type = match ? `image/${match[1]}` : `image`;
        formData.append('image', { uri: image, name: filename, type } as any);
      }

      await axios.post('http://localhost:5000/couriers/incident', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      Alert.alert('Success', 'Incident report submitted successfully.');
      router.back();
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to submit incident.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <GridBackground />
      <ScrollView className="flex-1 p-6 relative z-10">
        <View className="bg-white rounded-xl p-6 mb-6 shadow-sm border border-gray-200">
          <Text className="text-2xl font-poppins-bold text-gray-800 mb-2">
            Report Incident
          </Text>
          <Text className="text-gray-600 font-poppins mb-6">
            Please describe the incident that occurred during land transport.
          </Text>

          {/* Description */}
          <View className="mb-4">
            <Text className="text-gray-700 font-poppins-bold mb-2">Description *</Text>
            <TextInput
              className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 font-poppins h-24"
              placeholder="Describe the incident in detail..."
              value={description}
              onChangeText={setDescription}
              multiline
              textAlignVertical="top"
            />
          </View>

          {/* Total Cost */}
          <View className="mb-4">
            <Text className="text-gray-700 font-poppins-bold mb-2">Total Cost (₱)</Text>
            <TextInput
              className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 font-poppins"
              placeholder="Enter total cost"
              keyboardType="numeric"
              value={totalCost}
              onChangeText={setTotalCost}
            />
          </View>

          {/* Image */}
          {image && (
            <View className="items-center mb-4">
              <Image source={{ uri: image }} className="w-40 h-40 rounded-lg" resizeMode="cover" />
            </View>
          )}

          <TouchableOpacity
            className="bg-blue-600 py-3 rounded-lg mb-4 flex-row justify-center items-center"
            onPress={pickImage}
          >
            <Icon name="camera" size={20} color="white" />
            <Text className="text-white font-poppins-bold ml-2">Upload Image</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className={`py-4 rounded-lg flex-row justify-center items-center ${
              uploading ? 'bg-gray-400' : 'bg-red-600'
            }`}
            onPress={handleSubmit}
            disabled={uploading}
          >
            <Icon name="alert-circle" size={20} color="white" />
            <Text className="text-white font-poppins-bold text-lg ml-2">
              {uploading ? 'Submitting...' : 'Submit Report'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <NavigationBar activeTab="report" />
    </SafeAreaView>
  );
}
