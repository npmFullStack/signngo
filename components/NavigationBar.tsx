import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';
import { Feather } from '@expo/vector-icons';

interface NavigationBarProps {
  activeTab: 'home' | 'signature' | 'gallery' | 'settings';
}

export default function NavigationBar({ activeTab }: NavigationBarProps) {
  const navItems = [
    {
      id: 'home',
      label: 'Home',
      icon: 'home',
      route: '/',
    },
    {
      id: 'signature',
      label: 'Create',
      icon: 'edit-3',
      route: '/signature',
    },
    {
      id: 'gallery',
      label: 'Gallery',
      icon: 'image',
      route: '/gallery',
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: 'settings',
      route: '/settings',
    },
  ];

  const NavItem = ({ item }: { item: typeof navItems[0] }) => {
    const isActive = activeTab === item.id;
    
    if (item.id === 'gallery' || item.id === 'settings') {
      // For non-implemented routes, use TouchableOpacity with alert
      return (
        <TouchableOpacity
          className="flex-1 items-center justify-center py-2"
          onPress={() => alert(`${item.label} feature coming soon!`)}
        >
          <Feather
            name={item.icon as any}
            size={24}
            color={isActive ? '#3B82F6' : '#9CA3AF'}
          />
          <Text
            className={`text-xs mt-1 font-poppins ${
              isActive ? 'text-blue-500' : 'text-gray-400'
            }`}
          >
            {item.label}
          </Text>
        </TouchableOpacity>
      );
    }

    return (
      <Link href={item.route} asChild>
        <TouchableOpacity className="flex-1 items-center justify-center py-2">
          <Feather
            name={item.icon as any}
            size={24}
            color={isActive ? '#3B82F6' : '#9CA3AF'}
          />
          <Text
            className={`text-xs mt-1 font-poppins ${
              isActive ? 'text-blue-500' : 'text-gray-400'
            }`}
          >
            {item.label}
          </Text>
        </TouchableOpacity>
      </Link>
    );
  };

  return (
    <View className="bg-white border-t border-gray-200 flex-row">
      {navItems.map((item) => (
        <NavItem key={item.id} item={item} />
      ))}
    </View>
  );
}