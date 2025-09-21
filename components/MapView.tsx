import React, { useEffect, useState } from 'react';
import { View, Alert, Text, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';

interface BookingLocation {
  pickup_province: string | null;
  pickup_city: string | null;
  pickup_barangay: string | null;
  pickup_street: string | null;
  pickup_lat: number | null;
  pickup_lng: number | null;
}

interface MapComponentProps {
  booking: BookingLocation | null;
  status: string;
}

const MapComponent: React.FC<MapComponentProps> = ({ booking, status }) => {
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Permission to access location was denied');
        setLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
      setLoading(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to get current location');
      setLoading(false);
    }
  };

  const getPickupLocation = () => {
    if (booking?.pickup_lat && booking?.pickup_lng) {
      return { latitude: booking.pickup_lat, longitude: booking.pickup_lng };
    }
    // Default to Manila if no coordinates
    return { latitude: 14.5995, longitude: 120.9842 };
  };

  const getPickupAddress = () => {
    if (!booking) return '';
    
    if (booking.pickup_street) {
      return `${booking.pickup_street}, ${booking.pickup_barangay || ''}, ${booking.pickup_city || ''}, ${booking.pickup_province || ''}`.replace(/,\s*,/g, ',').trim();
    } else if (booking.pickup_barangay) {
      return `${booking.pickup_barangay}, ${booking.pickup_city || ''}, ${booking.pickup_province || ''}`.replace(/,\s*,/g, ',').trim();
    }
    return 'Pickup Location';
  };

  const createMapHTML = () => {
    const userLat = userLocation?.latitude || 14.5995;
    const userLng = userLocation?.longitude || 120.9842;
    const pickup = getPickupLocation();
    const showPickup = status === 'PENDING';
    const pickupAddress = getPickupAddress();

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <style>
          body { margin: 0; padding: 0; font-family: Arial, sans-serif; }
          #map { height: 100vh; width: 100%; }
          .custom-popup { padding: 8px; }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <script>
          // Initialize map
          const map = L.map('map').setView([${userLat}, ${userLng}], 13);

          // Add OpenStreetMap tiles
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
          }).addTo(map);

          // Custom user location icon
          const userIcon = L.divIcon({
            html: '<div style="background: #4285F4; border: 3px solid white; border-radius: 50%; width: 20px; height: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
            iconSize: [26, 26],
            iconAnchor: [13, 13],
            className: 'user-location-icon'
          });

          // Add user location marker
          const userMarker = L.marker([${userLat}, ${userLng}], { icon: userIcon })
            .addTo(map)
            .bindPopup('<div class="custom-popup"><strong>Your Location</strong><br>You are here</div>');

          ${showPickup ? `
          // Custom pickup location icon
          const pickupIcon = L.divIcon({
            html: '<div style="background: #EA4335; border: 2px solid white; border-radius: 50% 50% 50% 0; width: 30px; height: 30px; transform: rotate(-45deg); box-shadow: 0 2px 4px rgba(0,0,0,0.3); position: relative;"><div style="background: white; border-radius: 50%; width: 10px; height: 10px; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(45deg);"></div></div>',
            iconSize: [30, 30],
            iconAnchor: [15, 30],
            className: 'pickup-location-icon'
          });

          // Add pickup location marker
          const pickupMarker = L.marker([${pickup.latitude}, ${pickup.longitude}], { icon: pickupIcon })
            .addTo(map)
            .bindPopup('<div class="custom-popup"><strong>Pickup Location</strong><br>${pickupAddress}</div>');

          // Fit map to show both markers
          const group = L.featureGroup([userMarker, pickupMarker]);
          map.fitBounds(group.getBounds().pad(0.1));
          ` : ''}
        </script>
      </body>
      </html>
    `;
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-100">
        <ActivityIndicator size="large" color="#2563EB" />
        <Text className="mt-4 text-gray-600 font-poppins">Loading map...</Text>
      </View>
    );
  }

  if (!userLocation) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-100">
        <Text className="text-gray-600 font-poppins text-center px-4">
          Unable to get your location. Please check your location permissions.
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1">
      <WebView
        source={{ html: createMapHTML() }}
        style={{ flex: 1 }}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        renderLoading={() => (
          <View className="flex-1 justify-center items-center bg-gray-100">
            <ActivityIndicator size="large" color="#2563EB" />
          </View>
        )}
      />
    </View>
  );
};

export default MapComponent;