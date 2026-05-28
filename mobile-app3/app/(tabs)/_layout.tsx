import { Tabs } from 'expo-router';
import React from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Colors } from '@/constants/theme';
import { useColorScheme } from 'react-native';
// Colores de la Web-App
const WebColors = {
  background: '#F7F4EF',
  primary: '#7A1F2B',     // Guinda (activo)
  inactive: '#B08A57',    // Beige oscuro (inactivo)
  border: 'rgba(58, 58, 58, 0.18)',
};

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: WebColors.primary,
        tabBarInactiveTintColor: WebColors.inactive,
        tabBarStyle: {
          backgroundColor: WebColors.background,
          borderTopColor: WebColors.border,
        },
        headerShown: false,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Mapa',
          tabBarIcon: ({ color }) => <Ionicons size={28} name="map" color={color} />,
        }}
      />
      <Tabs.Screen
        name="rutas"
        options={{
          title: 'Rutas',
          tabBarIcon: ({ color }) => <Ionicons size={28} name="bus" color={color} />,
        }}
      />
      <Tabs.Screen
        name="reportar"
        options={{
          title: 'Reportar',
          tabBarIcon: ({ color }) => <Ionicons size={28} name="megaphone" color={color} />,
        }}
      />
    </Tabs>
  );
}
