import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Alert, Modal, FlatList } from 'react-native';
import { Colors } from '@/constants/theme';
import Ionicons from '@expo/vector-icons/Ionicons';

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
  const [modalVisible, setModalVisible] = useState(false);

  const handleSubmit = () => {
    if (!selectedIncident || !description) {
      Alert.alert('Error', 'Por favor selecciona el tipo de incidente y agrega una descripción.');
      return;
    }
    Alert.alert('Éxito', 'Reporte enviado correctamente.');
    setSelectedIncident(null);
    setDescription('');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Nuevo Reporte</Text>
      
      <Text style={styles.label}>Tipo de Incidente</Text>
      <TouchableOpacity 
        style={styles.dropdownButton} 
        onPress={() => setModalVisible(true)}
      >
        {selectedIncident ? (
          <View style={styles.dropdownButtonContent}>
            <Ionicons name={selectedIncident.iconName} size={20} color={Colors.light.primary} style={styles.dropdownIcon} />
            <Text style={styles.dropdownTextSelected}>{selectedIncident.label}</Text>
          </View>
        ) : (
          <Text style={styles.dropdownTextPlaceholder}>Selecciona una opción...</Text>
        )}
        <Ionicons name="chevron-down" size={20} color="#999" />
      </TouchableOpacity>

      <Text style={styles.label}>Descripción</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Describe el problema en detalle..."
        placeholderTextColor="#999"
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={4}
      />

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>Enviar Reporte</Text>
      </TouchableOpacity>

      {/* Modal para las opciones del Picker Custom */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setModalVisible(false)}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Selecciona el incidente</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={INCIDENT_OPTIONS}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={styles.optionItem}
                  onPress={() => {
                    setSelectedIncident(item);
                    setModalVisible(false);
                  }}
                >
                  <Ionicons name={item.iconName} size={24} color={Colors.light.primary} style={styles.optionIcon} />
                  <Text style={styles.optionText}>{item.label}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: Colors.light.background,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
    color: Colors.light.primary,
    marginTop: 40,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: Colors.light.text,
  },
  input: {
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    fontSize: 16,
    color: Colors.light.text,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  dropdownButton: {
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    color: Colors.light.text,
  },
  submitButton: {
    backgroundColor: Colors.light.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.light.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.light.text,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  optionIcon: {
    marginRight: 15,
  },
  optionText: {
    fontSize: 16,
    color: Colors.light.text,
  },
});
