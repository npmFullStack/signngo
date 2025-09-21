import React from 'react';
import { View, Text, TouchableOpacity, Modal, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface DrawerMenuProps {
  visible: boolean;
  onClose: () => void;
  slideAnimation: Animated.Value;
}

const DrawerMenu: React.FC<DrawerMenuProps> = ({ visible, onClose, slideAnimation }) => {
  const router = useRouter();

  const handleNavigation = (route: string) => {
    onClose();
    router.push(route as any);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View className="flex-1 flex-row">
        {/* Overlay */}
        <TouchableOpacity 
          className="flex-1 bg-black/50" 
          onPress={onClose}
          activeOpacity={1}
        />
        
        {/* Drawer */}
        <Animated.View 
          className="bg-white w-80 h-full shadow-lg"
          style={{
            transform: [
              {
                translateX: slideAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [320, 0],
                }),
              },
            ],
          }}
        >
          {/* Header */}
          <View className="bg-blue-600 p-6 pt-12 flex-row justify-between items-center">
            <Text className="text-white text-xl font-poppins-bold">Menu</Text>
            <TouchableOpacity onPress={onClose}>
              <Icon name="close" size={24} color="white" />
            </TouchableOpacity>
          </View>

          {/* Menu Items */}
          <View className="flex-1 pt-6">
            <TouchableOpacity
              className="flex-row items-center px-6 py-4 border-b border-gray-100"
              onPress={() => handleNavigation('/signature')}
            >
              <Icon name="draw-pen" size={24} color="#2563EB" />
              <Text className="ml-4 text-gray-800 text-lg font-poppins">Digital Signature</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-row items-center px-6 py-4 border-b border-gray-100"
              onPress={() => handleNavigation('/report-incident')}
            >
              <Icon name="alert-circle" size={24} color="#EF4444" />
              <Text className="ml-4 text-gray-800 text-lg font-poppins">Report Incident</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

export default DrawerMenu;