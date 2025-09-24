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
  delivery_province: string | null;
  delivery_city: string | null;
  delivery_barangay: string | null;
  delivery_street: string | null;
  origin_port: string;
  destination_port: string;
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

  const getLocationCoordinates = (locationType: 'pickup' | 'delivery' | 'origin_port' | 'destination_port') => {
    if (!booking) return { lat: 14.5995, lng: 120.9842 };

    const portCoordinates = {
      manila: { lat: 14.5995, lng: 120.9842 },
      cebu: { lat: 10.3157, lng: 123.8854 },
      davao: { lat: 7.1907, lng: 125.4553 },
      iloilo: { lat: 10.7202, lng: 122.5621 },
      'cagayan de oro': { lat: 8.4542, lng: 124.6319 },
      zamboanga: { lat: 6.9214, lng: 122.0790 },
    };

    switch (locationType) {
      case 'pickup':
        return { lat: 14.5995, lng: 120.9842 };
      case 'delivery':
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

  const getCurrentDestination = () => {
    if (!booking) return null;

    switch (status) {
      case 'PICKUP_SCHEDULED':
        return {
          coords: getLocationCoordinates('pickup'),
          label: 'Pickup Location',
          address: [booking.pickup_street, booking.pickup_barangay, booking.pickup_city, booking.pickup_province]
            .filter(Boolean)
            .join(', ') || 'Pickup Location',
        };
      case 'LOADED_TO_TRUCK':
      case 'ARRIVED_ORIGIN_PORT':
        return {
          coords: getLocationCoordinates('origin_port'),
          label: 'Origin Port',
          address: `${booking.origin_port?.charAt(0).toUpperCase()}${booking.origin_port?.slice(1).toLowerCase()} Port`,
        };
      case 'ARRIVED_DESTINATION_PORT':
        return {
          coords: getLocationCoordinates('destination_port'),
          label: 'Destination Port',
          address: `${booking.destination_port?.charAt(0).toUpperCase()}${booking.destination_port?.slice(1).toLowerCase()} Port`,
        };
      case 'OUT_FOR_DELIVERY':
        return {
          coords: getLocationCoordinates('delivery'),
          label: 'Delivery Location',
          address: [booking.delivery_street, booking.delivery_barangay, booking.delivery_city, booking.delivery_province]
            .filter(Boolean)
            .join(', ') || 'Delivery Location',
        };
      default:
        return null;
    }
  };

  const createMapHTML = () => {
    const userLat = userLocation?.latitude || 14.5995;
    const userLng = userLocation?.longitude || 120.9842;

    const currentDest = getCurrentDestination();

    return `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <style>
    body { margin: 0; padding: 0; }
    #map { height: 100vh; width: 100%; }
    .custom-popup { padding: 8px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 13px; max-width: 200px; }
    .popup-title { font-weight: bold; color: #1f2937; margin-bottom: 4px; }
    .popup-address { color: #6b7280; line-height: 1.4; }
    .user-location {
      background: #3B82F6;
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script src="https://unpkg.com/leaflet-routing-machine@3.2.12/dist/leaflet-routing-machine.js"></script>
  <link rel="stylesheet" href="https://unpkg.com/leaflet-routing-machine@3.2.12/dist/leaflet-routing-machine.css" />
  <script>
    const map = L.map('map').setView([${userLat}, ${userLng}], 12);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // User location marker
    const userMarker = L.circleMarker([${userLat}, ${userLng}], {
      radius: 12,
      fillColor: '#3B82F6',
      color: '#FFFFFF',
      weight: 3,
      opacity: 1,
      fillOpacity: 0.8,
      className: 'user-location'
    }).addTo(map);

    userMarker.bindPopup(\`
      <div class="custom-popup">
        <div class="popup-title">Your Location</div>
        <div class="popup-address">You are here</div>
      </div>
    \`);

    ${currentDest ? `
    const destMarker = L.marker([${currentDest.coords.lat}, ${currentDest.coords.lng}]).addTo(map);
    destMarker.bindPopup(\`
      <div class="custom-popup">
        <div class="popup-title">${currentDest.label}</div>
        <div class="popup-address">${currentDest.address}</div>
      </div>
    \`);

    L.Routing.control({
      waypoints: [
        L.latLng(${userLat}, ${userLng}),
        L.latLng(${currentDest.coords.lat}, ${currentDest.coords.lng})
      ],
      lineOptions: {
        styles: [{ color: "#EF4444", weight: 4, opacity: 0.7 }]
      },
      addWaypoints: false,
      draggableWaypoints: false,
      fitSelectedRoutes: false,
      show: false,
      createMarker: function() { return null; }
    }).addTo(map);

    // Fit map to user + destination
    const group = new L.featureGroup([userMarker, destMarker]);
    map.fitBounds(group.getBounds().pad(0.1));
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
