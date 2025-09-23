// app/track-order.tsx
import { View, Text, TextInput, TouchableOpacity, Image, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import GridBackground from '../components/GridBackground';
import NavigationBar from '../components/NavigationBar';
import MapComponent from '../components/MapView';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as Location from 'expo-location';
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
  delivery_province: string | null;
  delivery_city: string | null;
  delivery_barangay: string | null;
  delivery_street: string | null;
  preferred_departure?: string | null;
  created_at: string;
}

export default function TrackOrderScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [hasResults, setHasResults] = useState(false);
  const [bookingData, setBookingData] = useState<BookingData | null>(null);
  const [loading, setLoading] = useState(false);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  
  const API_BASE_URL = 'http://localhost:5000';

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
      }
    } catch (error) {
      console.log('Location permission error:', error);
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    return Math.round(distance * 10) / 10; // Round to 1 decimal place
  };

  const getLocationCoordinates = (booking: BookingData, locationType: 'pickup' | 'delivery' | 'origin_port' | 'destination_port') => {
    // Default coordinates for major Philippine ports
    const portCoordinates = {
      'manila': { lat: 14.5995, lng: 120.9842 },
      'cebu': { lat: 10.3157, lng: 123.8854 },
      'davao': { lat: 7.1907, lng: 125.4553 },
      'iloilo': { lat: 10.7202, lng: 122.5621 },
      'cagayan de oro': { lat: 8.4542, lng: 124.6319 },
      'zamboanga': { lat: 6.9214, lng: 122.0790 }
    };

    switch (locationType) {
      case 'pickup':
        // For demo purposes, use Manila coordinates for pickup
        return { lat: 14.5995, lng: 120.9842 };
      case 'delivery':
        // For demo purposes, use Cebu coordinates for delivery
        return { lat: 10.3157, lng: 123.8854 };
      case 'origin_port':
        const originPort = booking.origin_port?.toLowerCase();
        return portCoordinates[originPort as keyof typeof portCoordinates] || portCoordinates.manila;
      case 'destination_port':
        const destPort = booking.destination_port?.toLowerCase();
        return portCoordinates[destPort as keyof typeof portCoordinates] || portCoordinates.cebu;
      default:
        return { lat: 14.5995, lng: 120.9842 };
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      Alert.alert('Error', 'Please enter a booking or HWB number');
      return;
    }

    setLoading(true);
    setHasSearched(true);

    try {
      const response = await axios.get(
        `${API_BASE_URL}/couriers/public/search/${searchQuery.trim()}`,
        {
          timeout: 10000,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      const foundBooking = response.data.booking;
      
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
      
      if (error.code === 'ECONNABORTED') {
        Alert.alert('Error', 'Request timed out. Please try again.');
      } else if (error.response?.status === 404) {
        Alert.alert('Not Found', 'No bookings found with that number.');
      } else if (error.response?.status === 500) {
        Alert.alert('Server Error', 'Server is experiencing issues. Please try again later.');
      } else if (error.code === 'NETWORK_ERROR' || !error.response) {
        Alert.alert('Network Error', 'Please check your internet connection and try again.');
      } else {
        Alert.alert(
          'Error',
          `Failed to search (${error.response?.status || 'Unknown'}). Please try again.`
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'PICKUP_SCHEDULED':
        return 'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800';
      case 'LOADED_TO_TRUCK':
        return 'bg-gradient-to-r from-orange-100 to-orange-200 text-orange-800';
      case 'ARRIVED_ORIGIN_PORT':
        return 'bg-gradient-to-r from-indigo-100 to-indigo-200 text-indigo-800';
      case 'LOADED_TO_SHIP':
        return 'bg-gradient-to-r from-sky-100 to-sky-200 text-sky-800';
      case 'IN_TRANSIT':
        return 'bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800';
      case 'ARRIVED_DESTINATION_PORT':
        return 'bg-gradient-to-r from-pink-100 to-pink-200 text-pink-800';
      case 'OUT_FOR_DELIVERY':
        return 'bg-gradient-to-r from-teal-100 to-teal-200 text-teal-800';
      case 'DELIVERED':
        return 'bg-gradient-to-r from-green-100 to-green-200 text-green-800';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getCurrentLocationDisplay = (booking: BookingData) => {
    const { status } = booking;
    
    switch (status) {
      case 'PICKUP_SCHEDULED':
        const pickupCoords = getLocationCoordinates(booking, 'pickup');
        const pickupDistance = userLocation 
          ? calculateDistance(userLocation.latitude, userLocation.longitude, pickupCoords.lat, pickupCoords.lng)
          : null;
        
        return {
          label: 'Pickup Location',
          location: [
            booking.pickup_street,
            booking.pickup_barangay,
            booking.pickup_city,
            booking.pickup_province,
          ]
            .filter(Boolean)
            .join(", ") || "N/A",
          distance: pickupDistance ? `${pickupDistance} km away` : null
        };
        
      case 'LOADED_TO_TRUCK':
        const originCoords = getLocationCoordinates(booking, 'origin_port');
        const originDistance = userLocation 
          ? calculateDistance(userLocation.latitude, userLocation.longitude, originCoords.lat, originCoords.lng)
          : null;
        
        return {
          label: 'Origin Port',
          location: booking.origin_port 
            ? `${booking.origin_port.charAt(0).toUpperCase()}${booking.origin_port.slice(1).toLowerCase()} Port`
            : "N/A",
          distance: originDistance ? `${originDistance} km away` : null
        };
        
      case 'ARRIVED_DESTINATION_PORT':
        const destCoords = getLocationCoordinates(booking, 'destination_port');
        const destDistance = userLocation 
          ? calculateDistance(userLocation.latitude, userLocation.longitude, destCoords.lat, destCoords.lng)
          : null;
        
        return {
          label: 'Destination Port',
          location: booking.destination_port
            ? `${booking.destination_port.charAt(0).toUpperCase()}${booking.destination_port.slice(1).toLowerCase()} Port`
            : "N/A",
          distance: destDistance ? `${destDistance} km away` : null
        };
        
      case 'OUT_FOR_DELIVERY':
        const deliveryCoords = getLocationCoordinates(booking, 'delivery');
        const deliveryDistance = userLocation 
          ? calculateDistance(userLocation.latitude, userLocation.longitude, deliveryCoords.lat, deliveryCoords.lng)
          : null;
        
        return {
          label: 'Delivery Location',
          location: [
            booking.delivery_street,
            booking.delivery_barangay,
            booking.delivery_city,
            booking.delivery_province,
          ]
            .filter(Boolean)
            .join(", ") || "N/A",
          distance: deliveryDistance ? `${deliveryDistance} km away` : null
        };
        
      default:
        return {
          label: 'Current Location',
          location: [
            booking.pickup_street,
            booking.pickup_barangay,
            booking.pickup_city,
            booking.pickup_province,
          ]
            .filter(Boolean)
            .join(", ") || "N/A",
          distance: null
        };
    }
  };

  const getNextDestination = (booking: BookingData) => {
    const { status } = booking;
    
    switch (status) {
      case 'PICKUP_SCHEDULED':
        const originCoords = getLocationCoordinates(booking, 'origin_port');
        const originDistance = userLocation 
          ? calculateDistance(userLocation.latitude, userLocation.longitude, originCoords.lat, originCoords.lng)
          : null;
        
        return {
          location: booking.origin_port
            ? `${booking.origin_port.charAt(0).toUpperCase()}${booking.origin_port.slice(1).toLowerCase()} Port`
            : "N/A",
          distance: originDistance ? `${originDistance} km away` : null
        };
        
      case 'LOADED_TO_TRUCK':
      case 'ARRIVED_ORIGIN_PORT':
        const destCoords = getLocationCoordinates(booking, 'destination_port');
        const destDistance = userLocation 
          ? calculateDistance(userLocation.latitude, userLocation.longitude, destCoords.lat, destCoords.lng)
          : null;
        
        return {
          location: booking.destination_port
            ? `${booking.destination_port.charAt(0).toUpperCase()}${booking.destination_port.slice(1).toLowerCase()} Port`
            : "N/A",
          distance: destDistance ? `${destDistance} km away` : null
        };
        
      case 'ARRIVED_DESTINATION_PORT':
      case 'OUT_FOR_DELIVERY':
        const deliveryCoords = getLocationCoordinates(booking, 'delivery');
        const deliveryDistance = userLocation 
          ? calculateDistance(userLocation.latitude, userLocation.longitude, deliveryCoords.lat, deliveryCoords.lng)
          : null;
        
        return {
          location: [
            booking.delivery_street,
            booking.delivery_barangay,
            booking.delivery_city,
            booking.delivery_province,
          ]
            .filter(Boolean)
            .join(", ") || "N/A",
          distance: deliveryDistance ? `${deliveryDistance} km away` : null
        };
        
      case 'DELIVERED':
        return { location: "Delivered", distance: null };
      default:
        return { location: "N/A", distance: null };
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <GridBackground />
      <View className="flex-1 relative z-10">
        {/* Search Bar */}
        <View className="px-6 pb-2">
          <View className="flex-row items-center bg-white rounded-xl px-4 py-2 border border-gray-300 shadow-sm">
            <TextInput
              className="flex-1 font-poppins text-gray-800 rounded-lg px-3 py-2"
              placeholder="Search HWB/Booking number"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
            />
            <TouchableOpacity onPress={handleSearch} disabled={loading}>
              <Icon name={loading ? 'loading' : 'magnify'} size={22} color="#6B7280" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Content */}
        <View className="flex-1 px-6">
          {hasSearched ? (
            hasResults && bookingData ? (
              <View className="flex-1">
                {/* Booking Info Card */}
                <View className="bg-white rounded-lg p-3 mb-2 shadow-sm border border-gray-200">
                  {/* Top row: Booking number + Status */}
                  <View className="flex-row justify-between items-center mb-1">
                    <Text className="font-poppins-bold text-sm text-gray-800">
                      {bookingData.booking_number}
                    </Text>
                    <Text
                      className={`px-3 py-1 rounded-full text-[10px] font-poppins-bold ${getStatusStyle(
                        bookingData.status
                      )}`}
                    >
                      {bookingData.status.replace(/_/g, ' ')}
                    </Text>
                  </View>

                  {/* HWB + Booked Date */}
                  <Text className="font-poppins text-[11px] text-gray-500">
                    HWB: {bookingData.hwb_number}
                  </Text>
                  {bookingData.created_at && (
                    <Text className="font-poppins text-[11px] text-gray-500 mb-2">
                      Booked On: {new Date(bookingData.created_at).toLocaleDateString()}
                    </Text>
                  )}

                  {/* Current & Next Destinations */}
                  <View className="mb-2">
                    <View className="flex-row items-start mb-2">
                      <Icon name="map-marker" size={14} color="#2563EB" />
                      <View className="ml-1 flex-1">
                        <Text className="font-poppins-bold text-[11px] text-gray-700">
                          {getCurrentLocationDisplay(bookingData).label}
                        </Text>
                        <Text className="font-poppins text-[11px] text-gray-600">
                          {getCurrentLocationDisplay(bookingData).location}
                        </Text>
                        {getCurrentLocationDisplay(bookingData).distance && (
                          <Text className="font-poppins text-[10px] text-blue-600 mt-0.5">
                            📍 {getCurrentLocationDisplay(bookingData).distance}
                          </Text>
                        )}
                      </View>
                    </View>
                    
                    {bookingData.status !== 'DELIVERED' && (
                      <View className="flex-row items-start">
                        <Icon name="target" size={14} color="#10B981" />
                        <View className="ml-1 flex-1">
                          <Text className="font-poppins-bold text-[11px] text-gray-700">
                            Next Destination
                          </Text>
                          <Text className="font-poppins text-[11px] text-gray-600">
                            {getNextDestination(bookingData).location}
                          </Text>
                          {getNextDestination(bookingData).distance && (
                            <Text className="font-poppins text-[10px] text-green-600 mt-0.5">
                              🎯 {getNextDestination(bookingData).distance}
                            </Text>
                          )}
                        </View>
                      </View>
                    )}
                  </View>

                  {/* Shipper & Consignee side by side */}
                  <View className="flex-row justify-between mb-1">
                    <View className="flex-1 mr-2">
                      <Text className="font-poppins-bold text-[11px] text-gray-700">Shipper</Text>
                      <Text
                        className="font-poppins text-[11px] text-gray-600"
                        numberOfLines={2}
                        ellipsizeMode="tail"
                      >
                        {bookingData.shipper}
                      </Text>
                    </View>
                    <View className="flex-1">
                      <Text className="font-poppins-bold text-[11px] text-gray-700">Consignee</Text>
                      <Text
                        className="font-poppins text-[11px] text-gray-600"
                        numberOfLines={2}
                        ellipsizeMode="tail"
                      >
                        {bookingData.consignee}
                      </Text>
                    </View>
                  </View>

                  {/* Action Buttons */}
                  <View className="flex-row justify-end mt-2 space-x-2">
                    <TouchableOpacity className="flex-row items-center border border-blue-500 px-2 py-0.5 rounded-full">
                      <Icon name="draw-pen" size={12} color="#2563EB" />
                      <Text className="text-blue-600 font-poppins-bold text-[11px] ml-1">
                        Sign
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity className="flex-row items-center border border-red-500 px-2 py-0.5 rounded-full">
                      <Icon name="alert-circle" size={12} color="#DC2626" />
                      <Text className="text-red-600 font-poppins-bold text-[11px] ml-1">
                        Report
                      </Text>
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
    </SafeAreaView>
  );
}