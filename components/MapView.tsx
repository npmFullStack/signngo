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
        return { lat: 14.5995, lng: 120.9842 }; // Manila for demo
      case 'delivery':
        return { lat: 10.3157, lng: 123.8854 }; // Cebu for demo
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
            .filter(Boolean).join(', ') || 'Pickup Location'
        };
      case 'LOADED_TO_TRUCK':
        return {
          coords: getLocationCoordinates('origin_port'),
          label: 'Origin Port',
          address: `${booking.origin_port?.charAt(0).toUpperCase()}${booking.origin_port?.slice(1).toLowerCase()} Port`
        };
      case 'ARRIVED_DESTINATION_PORT':
        return {
          coords: getLocationCoordinates('destination_port'),
          label: 'Destination Port',
          address: `${booking.destination_port?.charAt(0).toUpperCase()}${booking.destination_port?.slice(1).toLowerCase()} Port`
        };
      case 'OUT_FOR_DELIVERY':
        return {
          coords: getLocationCoordinates('delivery'),
          label: 'Delivery Location',
          address: [booking.delivery_street, booking.delivery_barangay, booking.delivery_city, booking.delivery_province]
            .filter(Boolean).join(', ') || 'Delivery Location'
        };
      default:
        return null;
    }
  };

  const getNextDestination = () => {
    if (!booking) return null;

    switch (status) {
      case 'PICKUP_SCHEDULED':
        return {
          coords: getLocationCoordinates('origin_port'),
          label: 'Next: Origin Port',
          address: `${booking.origin_port?.charAt(0).toUpperCase()}${booking.origin_port?.slice(1).toLowerCase()} Port`
        };
      case 'LOADED_TO_TRUCK':
      case 'ARRIVED_ORIGIN_PORT':
        return {
          coords: getLocationCoordinates('destination_port'),
          label: 'Next: Destination Port',
          address: `${booking.destination_port?.charAt(0).toUpperCase()}${booking.destination_port?.slice(1).toLowerCase()} Port`
        };
      case 'ARRIVED_DESTINATION_PORT':
      case 'OUT_FOR_DELIVERY':
        return {
          coords: getLocationCoordinates('delivery'),
          label: 'Next: Delivery',
          address: [booking.delivery_street, booking.delivery_barangay, booking.delivery_city, booking.delivery_province]
            .filter(Boolean).join(', ') || 'Delivery Location'
        };
      default:
        return null;
    }
  };

  const createMapHTML = () => {
    const userLat = userLocation?.latitude || 14.5995;
    const userLng = userLocation?.longitude || 120.9842;
    
    const currentDest = getCurrentDestination();
    const nextDest = getNextDestination();

    return `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <style>
    body { margin: 0; padding: 0; }
    #map { height: 100vh; width: 100%; }
    .custom-popup { 
      padding: 8px; 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
      font-size: 13px; 
      max-width: 200px;
    }
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

    // Create cute blue circle for user location
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

    // Create SVG pin factory for destinations
    function createDestinationPin(color, type) {
      let iconSvg = '';
      
      if (type === 'current') {
        iconSvg = \`
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="\${color}" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3" fill="white"/>
          </svg>
        \`;
      } else {
        iconSvg = \`
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="\${color}" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="2" fill="white"/>
          </svg>
        \`;
      }

      return L.divIcon({
        html: iconSvg,
        className: '',
        iconSize: type === 'current' ? [32, 32] : [28, 28],
        iconAnchor: type === 'current' ? [16, 32] : [14, 28],
        popupAnchor: [0, type === 'current' ? -32 : -28]
      });
    }

    ${currentDest ? `
    // Current destination marker
    const currentMarker = L.marker([${currentDest.coords.lat}, ${currentDest.coords.lng}], { 
      icon: createDestinationPin('#EF4444', 'current')
    }).addTo(map);
    
    currentMarker.bindPopup(\`
      <div class="custom-popup">
        <div class="popup-title">${currentDest.label}</div>
        <div class="popup-address">${currentDest.address}</div>
      </div>
    \`);

    // Route to current destination
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
    ` : ''}

    ${nextDest && status !== 'DELIVERED' ? `
    // Next destination marker
    const nextMarker = L.marker([${nextDest.coords.lat}, ${nextDest.coords.lng}], { 
      icon: createDestinationPin('#10B981', 'next')
    }).addTo(map);
    
    nextMarker.bindPopup(\`
      <div class="custom-popup">
        <div class="popup-title">${nextDest.label}</div>
        <div class="popup-address">${nextDest.address}</div>
      </div>
    \`);

    ${currentDest ? `
    // Route from current to next destination
    L.Routing.control({
      waypoints: [
        L.latLng(${currentDest.coords.lat}, ${currentDest.coords.lng}),
        L.latLng(${nextDest.coords.lat}, ${nextDest.coords.lng})
      ],
      lineOptions: {
        styles: [{ color: "#10B981", weight: 3, opacity: 0.6, dashArray: "10, 5" }]
      },
      addWaypoints: false,
      draggableWaypoints: false,
      fitSelectedRoutes: false,
      show: false,
      createMarker: function() { return null; }
    }).addTo(map);
    ` : ''}
    ` : ''}

    // Fit map to show all markers
    const group = new L.featureGroup();
    group.addLayer(userMarker);
    ${currentDest ? `group.addLayer(currentMarker);` : ''}
    ${nextDest && status !== 'DELIVERED' ? `group.addLayer(nextMarker);` : ''}
    
    if (group.getLayers().length > 1) {
      map.fitBounds(group.getBounds().pad(0.1));
    }
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