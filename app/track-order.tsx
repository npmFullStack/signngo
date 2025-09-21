import { View, Text, TextInput, TouchableOpacity, Image } from 'react-native';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import GridBackground from '../components/GridBackground';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function TrackOrderScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [hasResults, setHasResults] = useState(false);

  const handleSearch = () => {
    setHasSearched(true);
    setHasResults(searchQuery.length > 0);
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <GridBackground />
      
      <View className="flex-1 p-6 relative z-10">
        {/* Search Bar at the top */}
        <View className="flex-row items-center bg-white rounded-xl px-4 py-3 mb-6">
          <TextInput
            className="flex-1 font-poppins text-gray-800"
            placeholder="Search HWB/Booking number"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
          />
          <TouchableOpacity onPress={handleSearch}>
            <Icon name="magnify" size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>

        <View className="flex-1 justify-center items-center">
          {hasSearched ? (
            hasResults ? (
              <>
                <Image
                  source={require('../assets/image/trackorder.png')}
                  className="w-64 h-64 mb-6"
                  resizeMode="contain"
                />
                <Text className="text-gray-600 font-poppins text-center">
                  Map showing pickup/drop-off location will appear here
                </Text>
              </>
            ) : (
              <>
                <Image
                  source={require('../assets/image/no-data.png')}
                  className="w-64 h-64 mb-6"
                  resizeMode="contain"
                />
                <Text className="text-gray-600 font-poppins text-center">
                  No results found. Please check your HWB/Booking number and try again.
                </Text>
              </>
            )
          ) : (
            <>
              <Image
                source={require('../assets/image/trackorder.png')}
                className="w-64 h-64 mb-6"
                resizeMode="contain"
              />
              <Text className="text-gray-600 font-poppins text-center">
                Search for your HWB or Booking number to locate pickup/drop-off points
              </Text>
            </>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}