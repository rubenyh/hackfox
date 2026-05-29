import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { auth } from '../../firebaseConfig';
import { signOut } from 'firebase/auth';
import Ionicons from '@expo/vector-icons/Ionicons';
import { AccessibilitySettings } from '@/components/AccessibilitySettings';
import { useAccessibility } from '@/context/AccessibilityContext';

const WebColors = {
  background: '#F7F4EF',
  foreground: '#3A3A3A',
  primary: '#7A1F2B',
  secondary: '#E8DDD0',
  accent: '#B08A57',
  surface: '#FFFFFF',
  border: 'rgba(58, 58, 58, 0.18)',
};

export default function ProfileScreen() {
  const [showAccessibility, setShowAccessibility] = useState(false);
  const { announce } = useAccessibility();
  
  const user = auth.currentUser;

  const handleLogout = async () => {
    try {
      announce('Cerrando sesión');
      await signOut(auth);
    } catch (error) {
      console.error("Error al cerrar sesión", error);
    }
  };

  const openAccessibility = () => {
    setShowAccessibility(true);
    announce('Abriendo configuración de accesibilidad');
  };

  return (
    <View style={{ flex: 1, backgroundColor: WebColors.background }}>
      <ScrollView 
        contentContainerStyle={styles.container}
        accessible={true}
        accessibilityRole="list"
      >
        
        {/* User Info Section */}
        <View style={styles.profileHeader} accessible={true} accessibilityRole="header">
          <View style={styles.avatarCircle}>
            <Ionicons name="person" size={50} color={WebColors.background} accessible={false} />
          </View>
          <Text style={styles.userName} accessibilityRole="text">
            {user?.email || 'correo@ejemplo.com'}
          </Text>
        </View>

        {/* Settings Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle} accessibilityRole="header">Configuración</Text>
          
          <TouchableOpacity 
            style={styles.optionButton}
            onPress={openAccessibility}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Abrir configuración de accesibilidad"
            accessibilityHint="Abre un menú con opciones de voiceover y lector de pantalla"
          >
            <View style={styles.optionLeft}>
              <Ionicons name="accessibility" size={24} color={WebColors.primary} accessible={false} />
              <Text style={styles.optionText} accessible={false}>Accesibilidad</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" accessible={false} />
          </TouchableOpacity>
        </View>

        {/* Logout Section */}
        <View style={styles.logoutSection}>
          <TouchableOpacity 
            style={styles.logoutButton}
            onPress={handleLogout}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Cerrar sesión"
            accessibilityHint="Cierra tu sesión actual y regresa a la pantalla de inicio"
          >
            <Ionicons name="log-out-outline" size={24} color={WebColors.primary} accessible={false} />
            <Text style={styles.logoutText} accessible={false}>Cerrar Sesión</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>

      {/* Accessibility Modal */}
      <Modal visible={showAccessibility} animationType="slide" transparent={false}>
        <AccessibilitySettings onClose={() => setShowAccessibility(false)} />
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: WebColors.background,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 40,
  },
  avatarCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: WebColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: WebColors.primary,
    marginBottom: 4,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: WebColors.foreground,
    marginBottom: 16,
    marginLeft: 4,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: WebColors.surface,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: WebColors.border,
    marginBottom: 12,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionText: {
    fontSize: 16,
    color: WebColors.foreground,
    marginLeft: 12,
    fontWeight: '500',
  },
  logoutSection: {
    marginTop: 'auto',
    paddingTop: 40,
    paddingBottom: 20,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: WebColors.primary,
  },
  logoutText: {
    fontSize: 16,
    color: WebColors.primary,
    marginLeft: 8,
    fontWeight: 'bold',
  },
});
