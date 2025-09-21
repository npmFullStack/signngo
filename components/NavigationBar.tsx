import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface NavigationBarProps {
  activeTab: 'notifications' | 'home' | 'account';
}

export default function NavigationBar({ activeTab }: NavigationBarProps) {
  const navItems = [
    {
      id: 'notifications',
      label: 'Notifications',
      icon: 'bell-outline',
      activeIcon: 'bell',
      route: '/notifications',
    },
    {
      id: 'home',
      label: 'Home',
      icon: 'home-outline',
      activeIcon: 'home',
      route: '/',
    },
    {
      id: 'account',
      label: 'Account',
      icon: 'account-outline',
      activeIcon: 'account',
      route: '/account',
    },
  ];

  const NavItem = ({ item }: { item: typeof navItems[0] }) => {
    const isActive = activeTab === item.id;
    
    if (item.id === 'notifications' || item.id === 'account') {
      return (
        <TouchableOpacity
          className="flex-1 items-center justify-center py-3"
          onPress={() => alert(`${item.label} feature coming soon!`)}
        >
          <Icon
            name={isActive ? item.activeIcon : item.icon}
            size={24}
            color={isActive ? '#2563EB' : '#6B7280'}
          />
          <Text
            className={`text-[10px] mt-1 font-medium ${
              isActive ? 'text-blue-600' : 'text-gray-500'
            }`}
          >
            {item.label}
          </Text>
        </TouchableOpacity>
      );
    }

    return (
      <Link href={item.route} asChild>
        <TouchableOpacity className="flex-1 items-center justify-center">
          <View className="items-center justify-center w-12 h-12 bg-blue-600 rounded-full">
            <Icon
              name={isActive ? item.activeIcon : item.icon}
              size={24}
              color="#FFFFFF"
            />
          </View>
          <Text className="text-[10px] mt-1 font-medium text-blue-600">
            {item.label}
          </Text>
        </TouchableOpacity>
      </Link>
    );
  };

  return (
    <View className="bg-white border-t border-gray-200 flex-row justify-around items-center h-16">
      {navItems.map((item) => (
        <NavItem key={item.id} item={item} />
      ))}
    </View>
  );
}