// app/track-order.tsx
import { View, Text, TextInput, TouchableOpacity, Image, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import GridBackground from '../components/GridBackground';
import NavigationBar from '../components/NavigationBar';
import MapComponent from '../components/MapView';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as Location from 'expo-location';
import { useBookingStore } from '../store/bookingStore';
import { getPortByValue } from '../utils/shipRoutes';

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
  booking_date: string;
    created_at: string;
}

const statusMap = {
  PICKUP_SCHEDULED: {
    label: "Pickup",
    color: "bg-yellow-500 text-white"
  },
  LOADED_TO_TRUCK: {
    label: "Loaded Truck",
    color: "bg-orange-500 text-white"
  },
  ARRIVED_ORIGIN_PORT: {
    label: "Origin Port",
    color: "bg-indigo-500 text-white"
  },
  LOADED_TO_SHIP: {
    label: "Loaded Ship",
    color: "bg-sky-500 text-white"
  },
  IN_TRANSIT: {
    label: "Transit",
    color: "bg-purple-500 text-white"
  },
  ARRIVED_DESTINATION_PORT: {
    label: "Dest. Port",
    color: "bg-pink-500 text-white"
  },
  OUT_FOR_DELIVERY: {
    label: "Delivery",
    color: "bg-teal-500 text-white"
  },
  DELIVERED: {
    label: "Delivered",
    color: "bg-green-500 text-white"
  }
};

export default function TrackOrderScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [searchAttempted, setSearchAttempted] = useState(false);
  const { currentBooking, searchBooking, loading } = useBookingStore();
  const router = useRouter();

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
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return Math.round(distance * 10) / 10;
  };

  const getLocationCoordinates = async (booking: BookingData, locationType: 'pickup' | 'delivery' | 'origin_port' | 'destination_port') => {
    switch (locationType) {
      case 'pickup':
        // For pickup, try to geocode the actual address
        const pickupAddress = [booking.pickup_street, booking.pickup_barangay, booking.pickup_city, booking.pickup_province]
          .filter(Boolean)
          .join(', ');
        if (pickupAddress && pickupAddress !== '') {
          try {
            const geocoded = await Location.geocodeAsync(pickupAddress);
            if (geocoded.length > 0) {
              return { lat: geocoded[0].latitude, lng: geocoded[0].longitude };
            }
          } catch (error) {
            console.log('Geocoding error for pickup:', error);
          }
        }
        // Fallback to Manila if geocoding fails
        return { lat: 14.5995, lng: 120.9842 };

      case 'delivery':
        // For delivery, try to geocode the actual address
        const deliveryAddress = [booking.delivery_street, booking.delivery_barangay, booking.delivery_city, booking.delivery_province]
          .filter(Boolean)
          .join(', ');
        if (deliveryAddress && deliveryAddress !== '') {
          try {
            const geocoded = await Location.geocodeAsync(deliveryAddress);
            if (geocoded.length > 0) {
              return { lat: geocoded[0].latitude, lng: geocoded[0].longitude };
            }
          } catch (error) {
            console.log('Geocoding error for delivery:', error);
          }
        }
        // Fallback to Cebu if geocoding fails
        return { lat: 10.3157, lng: 123.8854 };

      case 'origin_port':
        const originPort = getPortByValue(booking.origin_port?.toLowerCase());
        return originPort ? { lat: originPort.lat, lng: originPort.lng } : { lat: 14.5995, lng: 120.9842 };

      case 'destination_port':
        const destPort = getPortByValue(booking.destination_port?.toLowerCase());
        return destPort ? { lat: destPort.lat, lng: destPort.lng } : { lat: 10.3157, lng: 123.8854 };

      default:
        return { lat: 14.5995, lng: 120.9842 };
    }
  };

  const getCurrentLocationDisplay = async (booking: BookingData) => {
    const { status } = booking;
    
    switch (status) {
      case 'PICKUP_SCHEDULED':
        const pickupCoords = await getLocationCoordinates(booking, 'pickup');
        const pickupDistance = userLocation
          ? calculateDistance(userLocation.latitude, userLocation.longitude, pickupCoords.lat, pickupCoords.lng)
          : null;
        return {
          label: 'Pickup Location',
          location: [booking.pickup_street, booking.pickup_barangay, booking.pickup_city, booking.pickup_province]
            .filter(Boolean)
            .join(', ') || 'N/A',
          distance: pickupDistance ? `${pickupDistance} km away` : null,
        };

      case 'LOADED_TO_TRUCK':
      case 'ARRIVED_ORIGIN_PORT':
        const originCoords = await getLocationCoordinates(booking, 'origin_port');
        const originDistance = userLocation
          ? calculateDistance(userLocation.latitude, userLocation.longitude, originCoords.lat, originCoords.lng)
          : null;
        return {
          label: 'Origin Port',
          location: booking.origin_port ?
            `${booking.origin_port.charAt(0).toUpperCase()}${booking.origin_port.slice(1).toLowerCase()} Port` : 'N/A',
          distance: originDistance ? `${originDistance} km away` : null,
        };

      case 'ARRIVED_DESTINATION_PORT':
        const destCoords = await getLocationCoordinates(booking, 'destination_port');
        const destDistance = userLocation
          ? calculateDistance(userLocation.latitude, userLocation.longitude, destCoords.lat, destCoords.lng)
          : null;
        return {
          label: 'Destination Port',
          location: booking.destination_port ?
            `${booking.destination_port.charAt(0).toUpperCase()}${booking.destination_port.slice(1).toLowerCase()} Port` : 'N/A',
          distance: destDistance ? `${destDistance} km away` : null,
        };

      case 'OUT_FOR_DELIVERY':
        const deliveryCoords = await getLocationCoordinates(booking, 'delivery');
        const deliveryDistance = userLocation
          ? calculateDistance(userLocation.latitude, userLocation.longitude, deliveryCoords.lat, deliveryCoords.lng)
          : null;
        return {
          label: 'Delivery Location',
          location: [booking.delivery_street, booking.delivery_barangay, booking.delivery_city, booking.delivery_province]
            .filter(Boolean)
            .join(', ') || 'N/A',
          distance: deliveryDistance ? `${deliveryDistance} km away` : null,
        };

      case 'DELIVERED':
        return { label: 'Delivered', location: 'Package Delivered', distance: null };

      default:
        return { label: 'Current Location', location: 'N/A', distance: null };
    }
  };

  const [currentLocationDisplay, setCurrentLocationDisplay] = useState({ label: '', location: '', distance: null });

  useEffect(() => {
    if (currentBooking) {
      getCurrentLocationDisplay(currentBooking).then(setCurrentLocationDisplay);
    }
  }, [currentBooking, userLocation]);

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      Alert.alert('Error', 'Please enter a booking or HWB number');
      return;
    }
    setSearchAttempted(true);
    searchBooking(searchQuery.trim());
  };

  const getStatusStyle = (status: string) => {
    return statusMap[status as keyof typeof statusMap] || { label: status.replace(/_/g, ' '), color: 'bg-gray-500 text-white' };
  };

const imageSource = searchAttempted && !loading 
  ? require('../assets/image/no-data.png')
  : require('../assets/image/trackorder.png');


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
          {currentBooking ? (
            <View className="flex-1">
              {/* Booking Info Card */}
              <View className="bg-white rounded-lg p-3 mb-2 shadow-sm border border-gray-200">
                <View className="flex-row justify-between items-center mb-1">
                  <Text className="font-poppins-bold text-sm text-gray-800">
                    {currentBooking.booking_number}
                  </Text>
                  <Text className={`px-3 py-1 rounded-full text-[10px] font-poppins-bold ${getStatusStyle(currentBooking.status).color}`}>
                    {getStatusStyle(currentBooking.status).label}
                  </Text>
                </View>
                <Text className="font-poppins text-[11px] text-gray-500">
                  HWB: {currentBooking.hwb_number}
                </Text>
{currentBooking.booking_date && (
    <Text className="font-poppins text-[11px] text-gray-500 mb-2">
        Booked On: {new Date(currentBooking.booking_date).toLocaleDateString()}
    </Text>
)}

                {/* Current Destination Only */}
                <View className="mb-2">
                  <View className="flex-row items-start mb-2">
                    <Icon name="map-marker" size={14} color="#2563EB" />
                    <View className="ml-1 flex-1">
                      <Text className="font-poppins-bold text-[11px] text-gray-700">
                        {currentLocationDisplay.label}
                      </Text>
                      <Text className="font-poppins text-[11px] text-gray-600">
                        {currentLocationDisplay.location}
                      </Text>
                      {currentLocationDisplay.distance && (
                        <View className="flex-row items-center mt-0.5">
                          <Icon name="map-marker-distance" size={10} color="#2563EB" />
                          <Text className="font-poppins text-[10px] text-blue-600 ml-1">
                            {currentLocationDisplay.distance}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                </View>

                {/* Shipper & Consignee */}
                <View className="flex-row justify-between mb-1">
                  <View className="flex-1 mr-2">
                    <Text className="font-poppins-bold text-[11px] text-gray-700">Shipper</Text>
                    <Text className="font-poppins text-[11px] text-gray-600" numberOfLines={2} ellipsizeMode="tail">
                      {currentBooking.shipper}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text className="font-poppins-bold text-[11px] text-gray-700">Consignee</Text>
                    <Text className="font-poppins text-[11px] text-gray-600" numberOfLines={2} ellipsizeMode="tail">
                      {currentBooking.consignee}
                    </Text>
                  </View>
                </View>

                {/* Action Buttons */}
                <View className="flex-row justify-end mt-2 space-x-2">
                  <TouchableOpacity
                    className="flex-row items-center border border-blue-500 px-2 py-0.5 rounded-full"
                    onPress={() => router.push("/signature")}
                  >
                    <Icon name="draw-pen" size={12} color="#2563EB" />
                    <Text className="text-blue-600 font-poppins-bold text-[11px] ml-1">
                      Sign
                    </Text>
                  </TouchableOpacity>

<TouchableOpacity 
  className="flex-row items-center border border-red-500 px-2 py-0.5 rounded-full"
  onPress={() => router.push("/report-incident")}
>
  <Icon name="alert-circle" size={12} color="#DC2626" />
  <Text className="text-red-600 font-poppins-bold text-[11px] ml-1">
    Report
  </Text>
</TouchableOpacity>
                </View>
              </View>

              {/* Map */}
              <View className="flex-1 bg-white rounded-xl overflow-hidden shadow-sm">
                <MapComponent booking={currentBooking} status={currentBooking.status} />
              </View>
            </View>
          ) : (
            <View className="flex-1 justify-center items-center">
              <Image
  source={imageSource}
  className="w-64 h-64 mb-6"
  resizeMode="contain"
/>
              <Text className="text-gray-600 font-poppins text-center">
                {searchAttempted && !loading 
                  ? 'No booking found. Please check your booking number and try again.'
                  : 'Search for your HWB or Booking number to locate pickup/drop-off points'
                }
              </Text>
            </View>
          )}
        </View>
        <NavigationBar activeTab="track" />
      </View>
    </SafeAreaView>
  );
}