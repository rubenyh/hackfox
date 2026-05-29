import { Tabs } from 'expo-router';
import React, { useState } from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Modal, TouchableOpacity } from 'react-native';
import { AccessibilitySettings } from '@/components/AccessibilitySettings';
import { useAccessibility } from '@/context/AccessibilityContext';

const WebColors = {
  background: '#F7F4EF',
  primary: '#7A1F2B',
  inactive: '#B08A57',
  border: 'rgba(58, 58, 58, 0.18)',
};

export default function TabLayout() {
  const [showAccessibilitySettings, setShowAccessibilitySettings] = useState(false);
  const { announce } = useAccessibility();

  const handleAccessibilityPress = () => {
    setShowAccessibilitySettings(true);
    announce('Abriendo configuración de accesibilidad');
  };

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
          headerRight: () => (
            <TouchableOpacity
              onPress={handleAccessibilityPress}
              style={{ marginRight: 16 }}
              accessibilityLabel="Abrir configuración de accesibilidad"
              accessibilityRole="button"
              accessibilityHint="Abre las opciones de accesibilidad incluyendo voiceover"
            >
              <Ionicons name="accessibility" size={24} color={WebColors.primary} />
            </TouchableOpacity>
          ),
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
      </Tabs>

      <Modal visible={showAccessibilitySettings} animationType="slide">
        <AccessibilitySettings onClose={() => setShowAccessibilitySettings(false)} />
      </Modal>
    </>
  );
}
