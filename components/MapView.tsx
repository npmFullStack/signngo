// components/MapView.tsx
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
    return { latitude: 14.5995, longitude: 120.9842 }; // Default Manila
  };

  const getPickupAddress = () => {
    if (!booking) return 'Pickup Location';
    const { pickup_street, pickup_barangay, pickup_city, pickup_province } = booking;
    return [pickup_street, pickup_barangay, pickup_city, pickup_province]
      .filter(Boolean)
      .join(', ');
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
          body { margin: 0; padding: 0; }
          #map { height: 100vh; width: 100%; }
          .custom-popup { padding: 8px; font-family: Arial, sans-serif; font-size: 13px; }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <script src="https://unpkg.com/leaflet-routing-machine@3.2.12/dist/leaflet-routing-machine.js"></script>
        <link rel="stylesheet" href="https://unpkg.com/leaflet-routing-machine@3.2.12/dist/leaflet-routing-machine.css" />
        <script>
          const map = L.map('map').setView([${userLat}, ${userLng}], 13);

          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
          }).addTo(map);

          // Create SVG pin factory
          function createPin(color) {
            const svg = \`
              <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="\${color}" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 2C8.1 2 5 5.1 5 9c0 5.2 7 13 7 13s7-7.8 7-13c0-3.9-3.1-7-7-7z"></path>
                <circle cx="12" cy="9" r="3" fill="white"/>
              </svg>
            \`;
            return L.divIcon({
              html: svg,
              className: '',
              iconSize: [36, 36],
              iconAnchor: [18, 36],
              popupAnchor: [0, -28]
            });
          }

          // User marker (blue-600)
          const userMarker = L.marker([${userLat}, ${userLng}], { icon: createPin('#2563EB') })
            .addTo(map)
            .bindPopup('<div class="custom-popup"><strong>Your Location</strong><br>You are here</div>');

          ${showPickup ? `
            // Pickup marker (red)
            const pickupMarker = L.marker([${pickup.latitude}, ${pickup.longitude}], { icon: createPin('red') })
              .addTo(map)
              .bindPopup('<div class="custom-popup"><strong>Pickup</strong><br>${pickupAddress}</div>');

            // Route line
            L.Routing.control({
              waypoints: [
                L.latLng(${userLat}, ${userLng}),
                L.latLng(${pickup.latitude}, ${pickup.longitude})
              ],
              lineOptions: {
                styles: [{ color: "#2563EB", weight: 5 }]
              },
              addWaypoints: false,
              draggableWaypoints: false,
              fitSelectedRoutes: true,
              show: false
            }).addTo(map);
          ` : ""}
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
      />
    </View>
  );
};

export default MapComponent;
