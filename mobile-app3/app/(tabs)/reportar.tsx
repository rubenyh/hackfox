import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useAccessibility } from '@/context/AccessibilityContext';

// Colores extraídos de la Web-App
const WebColors = {
  background: '#F7F4EF',
  foreground: '#3A3A3A',
  primary: '#7A1F2B',     // Guinda
  secondary: '#E8DDD0',
  accent: '#B08A57',      // Dorado/Ocre
  surface: '#FFFFFF',
  border: 'rgba(58, 58, 58, 0.18)',
};

type IncidentOption = {
  id: string;
  label: string;
  iconName: keyof typeof Ionicons.glyphMap;
};

const INCIDENT_OPTIONS: IncidentOption[] = [
  { id: '1', label: 'Bache / Daño Vial', iconName: 'warning' },
  { id: '2', label: 'Rampa Bloqueada', iconName: 'body' },
  { id: '3', label: 'Semáforo Dañado', iconName: 'alert-circle' },
  { id: '4', label: 'Queja de Transporte', iconName: 'bus' },
  { id: '5', label: 'Otro', iconName: 'add-circle' },
];

export default function ReportScreen() {
  const [selectedIncident, setSelectedIncident] = useState<IncidentOption | null>(null);
  const [description, setDescription] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { announce } = useAccessibility();

  useEffect(() => {
    announce('Pantalla de nuevo reporte. Selecciona el tipo de incidente y proporciona una descripción');
  }, [announce]);

  const handleSubmit = async () => {
    if (!selectedIncident || !description) {
      const message = 'Por favor selecciona el tipo de incidente y agrega una descripción';
      Alert.alert('Error', message);
      announce(message);
      return;
    }
    announce(`Reporte de ${selectedIncident.label} enviado correctamente`);
    Alert.alert('Éxito', 'Reporte enviado correctamente.');
    setSelectedIncident(null);
    setDescription('');
    setIsDropdownOpen(false);
  };

  return (
    <ScrollView
      style={{ backgroundColor: WebColors.background }}
      contentContainerStyle={styles.container}
      accessible={true}
      accessibilityRole="list"
    >
      <Text
        style={styles.title}
        accessible={true}
        accessibilityRole="header"
      >
        Nuevo Reporte
      </Text>

      <Text
        style={styles.label}
        accessible={true}
        accessibilityRole="header"
      >
        Tipo de Incidente
      </Text>
      {/* Dropdown Customizado Inline */}
      <TouchableOpacity
        style={[styles.dropdownButton, isDropdownOpen && styles.dropdownButtonOpen]}
        onPress={async () => {
          setIsDropdownOpen(!isDropdownOpen);
          const message = !isDropdownOpen ? 'Menú de incidentes abierto' : 'Menú de incidentes cerrado';
          announce(message);
        }}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel="Selector de tipo de incidente"
        accessibilityHint={selectedIncident ? `Actualmente seleccionado: ${selectedIncident.label}` : 'Toca para seleccionar un tipo de incidente'}
        accessibilityState={{ expanded: isDropdownOpen }}
      >
        {selectedIncident ? (
          <View style={styles.dropdownButtonContent} accessible={false}>
            <Ionicons name={selectedIncident.iconName} size={20} color={WebColors.primary} style={styles.dropdownIcon} accessible={false} />
            <Text style={styles.dropdownTextSelected} accessible={false}>{selectedIncident.label}</Text>
          </View>
        ) : (
          <Text style={styles.dropdownTextPlaceholder} accessible={false}>Selecciona una opción...</Text>
        )}
        <Ionicons name={isDropdownOpen ? "chevron-up" : "chevron-down"} size={20} color={WebColors.foreground} accessible={false} />
      </TouchableOpacity>

      {/* Lista de opciones desplegada directamente, sin oscurecer pantalla */}
      {isDropdownOpen && (
        <View
          style={styles.inlineDropdownList}
          accessible={true}
          accessibilityRole="list"
          accessibilityLabel="Opciones de incidentes"
        >
          {INCIDENT_OPTIONS.map((item, index) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.optionItem,
                index === INCIDENT_OPTIONS.length - 1 && { borderBottomWidth: 0 }
              ]}
              onPress={async () => {
                setSelectedIncident(item);
                setIsDropdownOpen(false);
                announce(`Seleccionado: ${item.label}`);
              }}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={item.label}
            >
              <Ionicons name={item.iconName} size={20} color={WebColors.primary} style={styles.optionIcon} accessible={false} />
              <Text style={styles.optionText} accessible={false}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <Text
        style={styles.label}
        accessible={true}
        accessibilityRole="header"
      >
        Descripción
      </Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Describe el problema en detalle..."
        placeholderTextColor="#999"
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={4}
        accessible={true}
        accessibilityLabel="Campo de descripción del reporte"
        accessibilityHint="Escribe una descripción detallada del problema"
      />

      {/* Botón con contorno */}
      <TouchableOpacity
        style={styles.submitButtonOutline}
        onPress={handleSubmit}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel="Enviar Reporte"
        accessibilityHint="Envía el reporte del incidente"
      >
        <Text style={styles.submitButtonTextOutline} accessible={false}>Enviar Reporte</Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: WebColors.background,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
    color: WebColors.primary,
    marginTop: 40,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: WebColors.foreground,
  },
  input: {
    backgroundColor: WebColors.surface,
    borderWidth: 1,
    borderColor: WebColors.border,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    fontSize: 16,
    color: WebColors.foreground,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  dropdownButton: {
    backgroundColor: WebColors.surface,
    borderWidth: 1,
    borderColor: WebColors.border,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownButtonOpen: {
    marginBottom: 0,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  inlineDropdownList: {
    backgroundColor: WebColors.surface,
    borderWidth: 1,
    borderColor: WebColors.border,
    borderTopWidth: 0,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    marginBottom: 24,
    overflow: 'hidden',
  },
  dropdownButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dropdownIcon: {
    marginRight: 10,
  },
  dropdownTextPlaceholder: {
    fontSize: 16,
    color: '#999',
  },
  dropdownTextSelected: {
    fontSize: 16,
    color: WebColors.foreground,
  },
  submitButtonOutline: {
    backgroundColor: 'transparent',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 2,
    borderColor: WebColors.primary,
  },
  submitButtonTextOutline: {
    color: WebColors.primary,
    fontSize: 18,
    fontWeight: 'bold',
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: WebColors.border,
  },
  optionIcon: {
    marginRight: 12,
  },
  optionText: {
    fontSize: 16,
    color: WebColors.foreground,
  },
});
