import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity, SafeAreaView } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Colors } from '@/constants/theme';
import { useAccessibility } from '@/context/AccessibilityContext';

const WebColors = {
  primary: '#7A1F2B',
  surface: '#FFFFFF',
  border: 'rgba(58, 58, 58, 0.18)',
};

export const AccessibilitySettings = ({ onClose }: { onClose: () => void }) => {
  const { voiceoverEnabled, setVoiceoverEnabled, screenReaderEnabled, setScreenReaderEnabled, announce } = useAccessibility();

  useEffect(() => {
    console.log('AccessibilitySettings montado');
    console.log('voiceoverEnabled:', voiceoverEnabled);
    console.log('screenReaderEnabled:', screenReaderEnabled);
    announce('Pantalla de configuración de accesibilidad abierta');
  }, [announce]);

  const handleVoiceoverToggle = (value: boolean) => {
    console.log('Voiceover toggle:', value);
    setVoiceoverEnabled(value);
    const message = value ? 'Voiceover activado' : 'Voiceover desactivado';
    announce(message);
  };

  const handleScreenReaderToggle = (value: boolean) => {
    console.log('ScreenReader toggle:', value);
    setScreenReaderEnabled(value);
    const message = value ? 'Lector de pantalla activado' : 'Lector de pantalla desactivado';
    announce(message);
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <View style={styles.headerContainer}>
        <TouchableOpacity
          onPress={onClose}
          accessibilityLabel="Cerrar"
          accessibilityRole="button"
          style={styles.closeButton}
        >
          <Ionicons name="close" size={28} color={Colors.light.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Accesibilidad</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView style={styles.container}>

        <View style={styles.settingSection}>
          <View style={styles.sectionHeader}>
            <Ionicons name="volume-high" size={24} color={WebColors.primary} />
            <Text style={styles.sectionTitle}>Voiceover</Text>
          </View>
          <View style={styles.settingItem}>
            <View style={styles.labelContainer}>
              <Text style={styles.settingLabel}>Activar Voiceover</Text>
              <Text style={styles.settingDescription}>
                Escucha descripciones de voz de los elementos de la pantalla
              </Text>
            </View>
            <Switch
              value={voiceoverEnabled}
              onValueChange={handleVoiceoverToggle}
              trackColor={{ false: '#ccc', true: '#81c784' }}
              thumbColor={voiceoverEnabled ? '#4caf50' : '#f1f1f1'}
            />
          </View>
        </View>

        <View style={styles.settingSection}>
          <View style={styles.sectionHeader}>
            <Ionicons name="phone-portrait" size={24} color={WebColors.primary} />
            <Text style={styles.sectionTitle}>Lector de Pantalla</Text>
          </View>
          <View style={styles.settingItem}>
            <View style={styles.labelContainer}>
              <Text style={styles.settingLabel}>Activar Lector de Pantalla</Text>
              <Text style={styles.settingDescription}>
                Compatible con VoiceOver (iOS) y TalkBack (Android)
              </Text>
            </View>
            <Switch
              value={screenReaderEnabled}
              onValueChange={handleScreenReaderToggle}
              trackColor={{ false: '#ccc', true: '#81c784' }}
              thumbColor={screenReaderEnabled ? '#4caf50' : '#f1f1f1'}
            />
          </View>
        </View>

        <View style={styles.infoSection}>
          <Ionicons name="information-circle" size={24} color={WebColors.primary} />
          <Text style={styles.infoText}>
            El Voiceover lee elementos en voz alta. El Lector de Pantalla usa tecnologías del sistema.
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: WebColors.border,
    backgroundColor: WebColors.surface,
  },
  closeButton: {
    padding: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.light.text,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  settingSection: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: WebColors.border,
    backgroundColor: WebColors.surface,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginLeft: 8,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  labelContainer: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
  },
  infoSection: {
    flexDirection: 'row',
    margin: 16,
    padding: 16,
    backgroundColor: WebColors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: WebColors.border,
    gap: 12,
  },
  infoText: {
    fontSize: 13,
    color: Colors.light.text,
    flex: 1,
  },
});
