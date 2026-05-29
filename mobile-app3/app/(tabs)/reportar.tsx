import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Alert, Image, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, storage, auth } from '../../firebaseConfig';
import * as Location from 'expo-location';
import Ionicons from '@expo/vector-icons/Ionicons';
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
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso denegado', 'Necesitamos acceso a la cámara para tomar la foto en vivo.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!selectedIncident || !description || !imageUri) {
      const message = 'Por favor selecciona el tipo de incidente, agrega una descripción y toma una foto en vivo';
      Alert.alert('Error', message);
      announce(message);
      return;
    }
    announce(`Reporte de ${selectedIncident.label} enviado correctamente`);

    setIsLoading(true);

    try {
      // Obtener ubicación GPS
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso denegado', 'Se requiere permiso de ubicación para enviar el reporte con precisión.');
        setIsLoading(false);
        return;
      }
      const location = await Location.getCurrentPositionAsync({});

      const blob = await new Promise<Blob>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.onload = function() {
          resolve(xhr.response);
        };
        xhr.onerror = function(e) {
          console.log(e);
          reject(new TypeError("Network request failed"));
        };
        xhr.responseType = "blob";
        xhr.open("GET", imageUri, true);
        xhr.send(null);
      });
      
      const filename = imageUri.substring(imageUri.lastIndexOf('/') + 1);
      const storageRef = ref(storage, `reports/img_${Date.now()}_${filename}`);
      
      await uploadBytes(storageRef, blob);
      const publicUrl = await getDownloadURL(storageRef);

      await addDoc(collection(db, 'reports'), {
        userId: auth.currentUser?.uid || 'anonymous',
        incidentType: selectedIncident.label,
        description: description,
        imageUrl: publicUrl,
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        createdAt: serverTimestamp(),
        status: 'pending',
      });

      Alert.alert('¡Éxito!', 'Tu reporte ha sido enviado exitosamente y está pendiente de revisión.');
      
      setSelectedIncident(null);
      setDescription('');
      setImageUri(null);
      setIsDropdownOpen(false);

    } catch (error: any) {
      console.error("Error enviando reporte:", error);
      Alert.alert('Error de Envío', error.message || 'Hubo un problema al subir el reporte.');
    } finally {
      setIsLoading(false);
    }
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
      <TouchableOpacity
        style={[styles.dropdownButton, isDropdownOpen ? styles.dropdownButtonOpen : null]}
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

      {isDropdownOpen ? (
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
                index === INCIDENT_OPTIONS.length - 1 ? { borderBottomWidth: 0 } : null
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

      <Text style={styles.label}>Descripción</Text>
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
    justifyContent: 'center',
    marginTop: 10,
    borderWidth: 2,
    borderColor: WebColors.primary,
    height: 60,
  },
  submitButtonDisabled: {
    opacity: 0.6,
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
  photoButton: {
    backgroundColor: WebColors.surface,
    borderWidth: 1,
    borderColor: WebColors.border,
    borderRadius: 12,
    padding: 24,
    marginBottom: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderStyle: 'dashed',
  },
  photoButtonText: {
    marginTop: 8,
    fontSize: 16,
    color: WebColors.primary,
    fontWeight: '600',
  },
  imagePreviewContainer: {
    marginBottom: 24,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: WebColors.border,
  },
  imagePreview: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  reTakePhotoButton: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: WebColors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  reTakePhotoText: {
    color: WebColors.surface,
    marginLeft: 6,
    fontWeight: 'bold',
  },
});
