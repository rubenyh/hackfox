import { Tabs } from 'expo-router';
import React, { useState } from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useAccessibility } from '@/context/AccessibilityContext';

const WebColors = {
  background: '#F7F4EF',
  primary: '#7A1F2B',
  inactive: '#B08A57',
  border: 'rgba(58, 58, 58, 0.18)',
};

export default function TabLayout() {
  const { announce } = useAccessibility();

  return (
    <>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: WebColors.primary,
          tabBarInactiveTintColor: WebColors.inactive,
          tabBarStyle: {
            backgroundColor: WebColors.background,
            borderTopColor: WebColors.border,
          },
          headerShown: true,
          headerStyle: {
            backgroundColor: WebColors.background,
          },
          headerTintColor: WebColors.primary,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            headerShown: false,
            title: 'Mapa',
            tabBarLabel: 'Mapa',
            tabBarIcon: ({ color }) => <Ionicons size={28} name="map" color={color} />,
            headerTitle: 'Mapa de Rutas',
          }}
        />
        <Tabs.Screen
          name="rutas"
          options={{
            title: 'Rutas',
            tabBarLabel: 'Rutas',
            tabBarIcon: ({ color }) => <Ionicons size={28} name="bus" color={color} />,
            headerTitle: 'Rutas Disponibles',
          }}
        />
        <Tabs.Screen
          name="reportar"
          options={{
            title: 'Reportar',
            tabBarLabel: 'Reportar',
            tabBarIcon: ({ color }) => <Ionicons size={28} name="megaphone" color={color} />,
            headerTitle: 'Nuevo Reporte',
          }}
        />
        <Tabs.Screen
          name="perfil"
          options={{
            title: 'Perfil',
            tabBarLabel: 'Perfil',
            tabBarIcon: ({ color }) => <Ionicons size={28} name="person" color={color} />,
            headerTitle: 'Mi Perfil',
          }}
        />
      </Tabs>
    </>
  );
}
