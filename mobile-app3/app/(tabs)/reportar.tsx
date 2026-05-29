import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Alert, Image, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, storage, functions } from '../../firebaseConfig';
import Ionicons from '@expo/vector-icons/Ionicons';

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
      Alert.alert('Error', 'Por favor selecciona el tipo de incidente, agrega una descripción y toma una foto en vivo.');
      return;
    }

    setIsLoading(true);

    try {
      // 1. Convertir la imagen local a un Blob para subirla a Storage
      const response = await fetch(imageUri);
      const blob = await response.blob();
      const filename = imageUri.substring(imageUri.lastIndexOf('/') + 1);
      const storageRef = ref(storage, `reports/img_${Date.now()}_${filename}`);
      
      // 2. Subir imagen a Firebase Storage
      await uploadBytes(storageRef, blob);
      const publicUrl = await getDownloadURL(storageRef);

      // 3. Llamar a la Cloud Function de Gemini para analizar la imagen
      const analyzeIncident = httpsCallable(functions, 'analyzeIncident');
      const geminiResult = await analyzeIncident({ imageUrl: publicUrl, incidentType: selectedIncident.label });
      const geminiAnalysis = (geminiResult.data as any)?.analysis || "Análisis no disponible";

      // 4. Guardar el reporte completo en Firestore
      await addDoc(collection(db, 'reports'), {
        incidentType: selectedIncident.label,
        description: description,
        imageUrl: publicUrl,
        geminiAnalysis: geminiAnalysis,
        createdAt: serverTimestamp(),
        status: 'pending', // pending, verified, rejected
      });

      Alert.alert('¡Éxito!', 'Tu reporte ha sido enviado y verificado exitosamente.');
      
      // Limpiar formulario
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
    >
      <Text style={styles.title}>Nuevo Reporte</Text>
      
      <Text style={styles.label}>Tipo de Incidente</Text>
      {/* Dropdown Customizado Inline */}
      <TouchableOpacity 
        style={[styles.dropdownButton, isDropdownOpen ? styles.dropdownButtonOpen : null]} 
        onPress={() => setIsDropdownOpen(!isDropdownOpen)}
      >
        {selectedIncident ? (
          <View style={styles.dropdownButtonContent}>
            <Ionicons name={selectedIncident.iconName} size={20} color={WebColors.primary} style={styles.dropdownIcon} />
            <Text style={styles.dropdownTextSelected}>{selectedIncident.label}</Text>
          </View>
        ) : (
          <Text style={styles.dropdownTextPlaceholder}>Selecciona una opción...</Text>
        )}
        <Ionicons name={isDropdownOpen ? "chevron-up" : "chevron-down"} size={20} color={WebColors.foreground} />
      </TouchableOpacity>

      {/* Lista de opciones desplegada directamente, sin oscurecer pantalla */}
      {isDropdownOpen ? (
        <View style={styles.inlineDropdownList}>
          {INCIDENT_OPTIONS.map((item, index) => (
            <TouchableOpacity 
              key={item.id}
              style={[
                styles.optionItem, 
                index === INCIDENT_OPTIONS.length - 1 ? { borderBottomWidth: 0 } : null
              ]}
              onPress={() => {
                setSelectedIncident(item);
                setIsDropdownOpen(false);
              }}
            >
              <Ionicons name={item.iconName} size={20} color={WebColors.primary} style={styles.optionIcon} />
              <Text style={styles.optionText}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : null}

      <Text style={styles.label}>Evidencia Fotográfica</Text>
      {imageUri ? (
        <View style={styles.imagePreviewContainer}>
          <Image source={{ uri: imageUri }} style={styles.imagePreview} />
          <TouchableOpacity style={styles.reTakePhotoButton} onPress={takePhoto}>
            <Ionicons name="camera-reverse" size={20} color={WebColors.surface} />
            <Text style={styles.reTakePhotoText}>Volver a tomar</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity style={styles.photoButton} onPress={takePhoto}>
          <Ionicons name="camera" size={32} color={WebColors.primary} />
          <Text style={styles.photoButtonText}>Tomar Foto en Vivo</Text>
        </TouchableOpacity>
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
      />

      {/* Botón con contorno */}
      <TouchableOpacity 
        style={[styles.submitButtonOutline, isLoading && styles.submitButtonDisabled]} 
        onPress={handleSubmit}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color={WebColors.primary} />
        ) : (
          <Text style={styles.submitButtonTextOutline}>Enviar Reporte</Text>
        )}
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
    height: 60, // Fixed height to avoid jumping during loading
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
