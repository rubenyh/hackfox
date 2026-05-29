import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import * as Speech from 'expo-speech';

export const AccessibilityTest = () => {
  const [testLog, setTestLog] = useState<string[]>(['Iniciando pruebas...']);

  const addLog = (message: string) => {
    setTestLog(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testSpeech = async () => {
    try {
      addLog('Intentando hablar con expo-speech...');
      await Speech.speak('Hola, esto es una prueba de voiceover', {
        language: 'es-ES',
      });
      addLog('✅ Speech funcionó correctamente');
    } catch (error) {
      addLog(`❌ Error en speech: ${error}`);
    }
  };

  const testContext = () => {
    addLog('Intentando acceder al contexto de accesibilidad...');
    try {
      // Esto probará si el contexto está disponible
      Alert.alert('Test', 'El contexto está disponible');
      addLog('✅ Contexto accesible');
    } catch (error) {
      addLog(`❌ Error de contexto: ${error}`);
    }
  };

  const clearLog = () => {
    setTestLog(['Iniciando pruebas...']);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🧪 Test de Accesibilidad</Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={testSpeech}
        >
          <Text style={styles.buttonText}>Probar Speech (Audio)</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={testContext}
        >
          <Text style={styles.buttonText}>Probar Contexto</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.clearButton]}
          onPress={clearLog}
        >
          <Text style={styles.buttonText}>Limpiar Log</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.logContainer}>
        <Text style={styles.logTitle}>📋 Log de Eventos:</Text>
        {testLog.map((log, idx) => (
          <Text key={idx} style={styles.logText}>
            {log}
          </Text>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    marginTop: 40,
  },
  buttonContainer: {
    gap: 10,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#7A1F2B',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  clearButton: {
    backgroundColor: '#999',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  logContainer: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  logTitle: {
    fontWeight: 'bold',
    marginBottom: 10,
    fontSize: 16,
  },
  logText: {
    fontSize: 12,
    color: '#333',
    marginBottom: 5,
    fontFamily: 'Courier New',
  },
});
