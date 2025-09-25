// components/MapView.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { View, Alert, Text, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';
import { getPortByValue } from '../utils/shipRoutes';

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
  const [destinationCoords, setDestinationCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [mapKey, setMapKey] = useState(0);

  useEffect(() => {
    getCurrentLocation();
  }, []);

  useEffect(() => {
    if (booking) {
      getCurrentDestinationCoords();
    }
  }, [booking, status]);

  // Force WebView re-render when destination changes
  useEffect(() => {
    if (destinationCoords) {
      setMapKey(prev => prev + 1);
    }
  }, [destinationCoords]);

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

  const getLocationCoordinates = useCallback(async (locationType: 'pickup' | 'delivery' | 'origin_port' | 'destination_port') => {
    if (!booking) return { lat: 14.5995, lng: 120.9842 };

    switch (locationType) {
      case 'pickup':
        // Try to geocode the actual pickup address
        const pickupAddress = [booking.pickup_street, booking.pickup_barangay, booking.pickup_city, booking.pickup_province]
          .filter(Boolean)
          .join(', ');
        
        if (pickupAddress && pickupAddress !== '') {
          try {
            const geocoded = await Location.geocodeAsync(pickupAddress + ', Philippines');
            if (geocoded.length > 0) {
              console.log('Pickup geocoded coordinates:', geocoded[0]);
              return { lat: geocoded[0].latitude, lng: geocoded[0].longitude };
            }
          } catch (error) {
            console.log('Geocoding error for pickup:', error);
          }
        }
        // Fallback to Manila if geocoding fails
        console.log('Using Manila fallback for pickup');
        return { lat: 14.5995, lng: 120.9842 };

      case 'delivery':
        // Try to geocode the actual delivery address
        const deliveryAddress = [booking.delivery_street, booking.delivery_barangay, booking.delivery_city, booking.delivery_province]
          .filter(Boolean)
          .join(', ');
        
        if (deliveryAddress && deliveryAddress !== '') {
          try {
            const geocoded = await Location.geocodeAsync(deliveryAddress + ', Philippines');
            if (geocoded.length > 0) {
              console.log('Delivery geocoded coordinates:', geocoded[0]);
              return { lat: geocoded[0].latitude, lng: geocoded[0].longitude };
            }
          } catch (error) {
            console.log('Geocoding error for delivery:', error);
          }
        }
        // Fallback to Cebu if geocoding fails
        console.log('Using Cebu fallback for delivery');
        return { lat: 10.3157, lng: 123.8854 };

      case 'origin_port':
        const originPort = getPortByValue(booking.origin_port?.toLowerCase());
        const originCoords = originPort ? { lat: originPort.lat, lng: originPort.lng } : { lat: 14.5995, lng: 120.9842 };
        console.log('Origin port coordinates:', originCoords, 'for port:', booking.origin_port);
        return originCoords;

      case 'destination_port':
        const destPort = getPortByValue(booking.destination_port?.toLowerCase());
        const destCoords = destPort ? { lat: destPort.lat, lng: destPort.lng } : { lat: 10.3157, lng: 123.8854 };
        console.log('Destination port coordinates:', destCoords, 'for port:', booking.destination_port);
        return destCoords;

      default:
        return { lat: 14.5995, lng: 120.9842 };
    }
  }, [booking]);

  const getCurrentDestinationCoords = useCallback(async () => {
    if (!booking) return;
    
    console.log('Getting destination coords for status:', status);
    let coords;
    switch (status) {
      case 'PICKUP_SCHEDULED':
        coords = await getLocationCoordinates('pickup');
        break;
      case 'LOADED_TO_TRUCK':
      case 'ARRIVED_ORIGIN_PORT':
        coords = await getLocationCoordinates('origin_port');
        break;
      case 'ARRIVED_DESTINATION_PORT':
        coords = await getLocationCoordinates('destination_port');
        break;
      case 'OUT_FOR_DELIVERY':
        coords = await getLocationCoordinates('delivery');
        break;
      default:
        coords = null;
    }
    console.log('Setting destination coords:', coords);
    setDestinationCoords(coords);
  }, [booking, status, getLocationCoordinates]);

  const getCurrentDestination = () => {
    if (!booking || !destinationCoords) return null;

    switch (status) {
      case 'PICKUP_SCHEDULED':
        return {
          coords: destinationCoords,
          label: 'Pickup Location',
          address: [booking.pickup_street, booking.pickup_barangay, booking.pickup_city, booking.pickup_province]
            .filter(Boolean)
            .join(', ') || 'Pickup Location',
        };
      case 'LOADED_TO_TRUCK':
      case 'ARRIVED_ORIGIN_PORT':
        return {
          coords: destinationCoords,
          label: 'Origin Port',
          address: `${booking.origin_port?.charAt(0).toUpperCase()}${booking.origin_port?.slice(1).toLowerCase()} Port`,
        };
      case 'ARRIVED_DESTINATION_PORT':
        return {
          coords: destinationCoords,
          label: 'Destination Port',
          address: `${booking.destination_port?.charAt(0).toUpperCase()}${booking.destination_port?.slice(1).toLowerCase()} Port`,
        };
      case 'OUT_FOR_DELIVERY':
        return {
          coords: destinationCoords,
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
        key={mapKey} // Force re-render when destination changes
        source={{ html: createMapHTML() }}
        style={{ flex: 1 }}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.log('WebView error: ', nativeEvent);
        }}
        onLoadStart={() => console.log('WebView loading started')}
        onLoadEnd={() => console.log('WebView loading ended')}
      />
    </View>
  );
};

export default MapComponent;