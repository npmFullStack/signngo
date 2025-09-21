import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import GridBackground from '../components/GridBackground';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function ReportIncidentScreen() {
  const router = useRouter();
  const [incidentType, setIncidentType] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [contactInfo, setContactInfo] = useState('');

  const handleSubmit = () => {
    if (!incidentType.trim() || !description.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    // Handle incident report submission here
    Alert.alert(
      'Incident Reported', 
      'Your incident report has been submitted successfully. We will contact you soon.',
      [
        { text: 'OK', onPress: () => router.back() }
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <GridBackground />
      <ScrollView className="flex-1 p-6 relative z-10">
        <View className="bg-white rounded-xl p-6 mb-6 shadow-sm">
          <Text className="text-2xl font-poppins-bold text-gray-800 mb-2">Report Incident</Text>
          <Text className="text-gray-600 font-poppins mb-6">
            Please provide details about the incident you want to report.
          </Text>

          {/* Incident Type */}
          <View className="mb-4">
            <Text className="text-gray-700 font-poppins-bold mb-2">Incident Type *</Text>
            <TextInput
              className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 font-poppins"
              placeholder="e.g., Package Damage, Delivery Delay, etc."
              value={incidentType}
              onChangeText={setIncidentType}
            />
          </View>

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

          {/* Location */}
          <View className="mb-4">
            <Text className="text-gray-700 font-poppins-bold mb-2">Location</Text>
            <TextInput
              className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 font-poppins"
              placeholder="Where did this incident occur?"
              value={location}
              onChangeText={setLocation}
            />
          </View>

          {/* Contact Information */}
          <View className="mb-6">
            <Text className="text-gray-700 font-poppins-bold mb-2">Contact Information</Text>
            <TextInput
              className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 font-poppins"
              placeholder="Phone number or email for follow-up"
              value={contactInfo}
              onChangeText={setContactInfo}
            />
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            className="bg-red-600 py-4 rounded-lg flex-row justify-center items-center"
            onPress={handleSubmit}
          >
            <Icon name="alert-circle" size={20} color="white" />
            <Text className="text-white font-poppins-bold text-lg ml-2">Submit Report</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}