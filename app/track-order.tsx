import { View, Text, TextInput, TouchableOpacity, Image, Animated, Alert } from 'react-native';
import { useState, useRef } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import GridBackground from '../components/GridBackground';
import NavigationBar from '../components/NavigationBar';
import DrawerMenu from '../components/DrawerMenu';
import MapComponent from '../components/MapView';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';

interface BookingData {
  id: string;
  booking_number: string;
  hwb_number: string;
  status: string;
  shipper: string;
  consignee: string;
  origin_port: string;
  destination_port: string;
  pickup_province: string | null;
  pickup_city: string | null;
  pickup_barangay: string | null;
  pickup_street: string | null;
  pickup_lat: number | null;
  pickup_lng: number | null;
  delivery_province: string | null;
  delivery_city: string | null;
  delivery_barangay: string | null;
  delivery_street: string | null;
  delivery_lat: number | null;
  delivery_lng: number | null;
}

export default function TrackOrderScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [hasResults, setHasResults] = useState(false);
  const [bookingData, setBookingData] = useState<BookingData | null>(null);
  const [loading, setLoading] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  
  const slideAnimation = useRef(new Animated.Value(0)).current;

  const API_BASE_URL = 'http://localhost:5000'; // Replace with your backend URL
  const AUTH_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjE3N2M3ODJiLTRiNDEtNGE3MS04NDg4LTg1M2UwZjUxYTc2ZiIsImVtYWlsIjoiYWRtaW5AZ21haWwuY29tIiwiaWF0IjoxNzU4NDc1MjAyLCJleHAiOjE3NTkwODAwMDJ9.EdrRI9S1t-XK4XX3jGsUrt9cMarss2_y6Xc6u_t4RbQ';

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      Alert.alert('Error', 'Please enter a booking or HWB number');
      return;
    }

    setLoading(true);
    setHasSearched(true);

    try {
      // Search for booking by booking_number or hwb_number
      const response = await axios.get(`${API_BASE_URL}/bookings`, {
        headers: {
          'Authorization': `Bearer ${AUTH_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });
      
      const bookings = response.data.bookings;
      
      const foundBooking = bookings.find((booking: BookingData) => 
        booking.booking_number === searchQuery || booking.hwb_number === searchQuery
      );

      if (foundBooking) {
        setBookingData(foundBooking);
        setHasResults(true);
      } else {
        setBookingData(null);
        setHasResults(false);
      }
    } catch (error: any) {
      console.error('Search error:', error);
      setBookingData(null);
      setHasResults(false);
      
      if (error.response?.status === 401) {
        Alert.alert('Authentication Error', 'Session expired. Please login again.');
      } else if (error.response?.status === 404) {
        Alert.alert('Not Found', 'No bookings found with that number.');
      } else {
        Alert.alert('Error', 'Failed to search. Please check your internet connection and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const openDrawer = () => {
    setDrawerVisible(true);
    Animated.timing(slideAnimation, {
      toValue: 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const closeDrawer = () => {
    Animated.timing(slideAnimation, {
      toValue: 0,
      duration: 300,
      useNativeDriver: false,
    }).start(() => {
      setDrawerVisible(false);
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'text-yellow-600';
      case 'PICKUP': return 'text-blue-600';
      case 'IN_PORT': return 'text-purple-600';
      case 'IN_TRANSIT': return 'text-orange-600';
      case 'DELIVERED': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <GridBackground />
      <View className="flex-1 relative z-10">
        {/* Search Bar */}
        <View className="px-6 pt-4 pb-2">
          <View className="flex-row items-center bg-white rounded-xl px-4 py-3 shadow-sm">
            <TextInput
              className="flex-1 font-poppins text-gray-800"
              placeholder="Search HWB/Booking number"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
            />
            <TouchableOpacity onPress={handleSearch} disabled={loading}>
              <Icon name={loading ? "loading" : "magnify"} size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Content */}
        <View className="flex-1 px-6">
          {hasSearched ? (
            hasResults && bookingData ? (
              <View className="flex-1">
                {/* Booking Info Card */}
                <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
                  <View className="flex-row justify-between items-start mb-2">
                    <Text className="font-poppins-bold text-lg text-gray-800">
                      {bookingData.booking_number}
                    </Text>
                    <Text className={`font-poppins-bold ${getStatusColor(bookingData.status)}`}>
                      {bookingData.status}
                    </Text>
                  </View>
                  <Text className="font-poppins text-gray-600 mb-1">
                    HWB: {bookingData.hwb_number}
                  </Text>
                  <Text className="font-poppins text-gray-600 mb-1">
                    From: {bookingData.shipper}
                  </Text>
                  <Text className="font-poppins text-gray-600">
                    To: {bookingData.consignee}
                  </Text>
                  
                  {/* Action Buttons - Only show when there are results */}
                  <View className="flex-row justify-between mt-4">
                    <TouchableOpacity
                      className="bg-blue-600 flex-1 mr-2 py-3 rounded-lg flex-row justify-center items-center"
                      onPress={openDrawer}
                    >
                      <Icon name="draw-pen" size={18} color="white" />
                      <Text className="text-white font-poppins-bold ml-2">Signature</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      className="bg-red-600 flex-1 ml-2 py-3 rounded-lg flex-row justify-center items-center"
                      onPress={openDrawer}
                    >
                      <Icon name="alert-circle" size={18} color="white" />
                      <Text className="text-white font-poppins-bold ml-2">Report</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Map */}
                <View className="flex-1 bg-white rounded-xl overflow-hidden shadow-sm">
                  <MapComponent booking={bookingData} status={bookingData.status} />
                </View>
              </View>
            ) : (
              <View className="flex-1 justify-center items-center">
                <Image
                  source={require('../assets/image/no-data.png')}
                  className="w-64 h-64 mb-6"
                  resizeMode="contain"
                />
                <Text className="text-gray-600 font-poppins text-center">
                  No results found. Please check your HWB/Booking number and try again.
                </Text>
              </View>
            )
          ) : (
            <View className="flex-1 justify-center items-center">
              <Image
                source={require('../assets/image/trackorder.png')}
                className="w-64 h-64 mb-6"
                resizeMode="contain"
              />
              <Text className="text-gray-600 font-poppins text-center">
                Search for your HWB or Booking number to locate pickup/drop-off points
              </Text>
            </View>
          )}
        </View>

        <NavigationBar activeTab="track" />
      </View>

      {/* Drawer Menu */}
      <DrawerMenu 
        visible={drawerVisible} 
        onClose={closeDrawer} 
        slideAnimation={slideAnimation} 
      />
    </SafeAreaView>
  );
}