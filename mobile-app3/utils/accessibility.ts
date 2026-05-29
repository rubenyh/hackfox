import * as Speech from 'expo-speech';

export const accessibilityAnnounce = async (text: string, options?: { rate?: number; pitch?: number }) => {
  try {
    // Verificar si el speech ya está hablando
    const isSpeaking = await Speech.isSpeakingAsync();

    if (isSpeaking) {
      await Speech.stop();
    }

    // Añadir un pequeño delay para asegurar que se detiene completamente
    await new Promise(resolve => setTimeout(resolve, 100));

    await Speech.speak(text, {
      language: 'es-ES',
      rate: options?.rate ?? 0.9,
      pitch: options?.pitch ?? 1.0,
      onDone: () => {
        console.log('Speech completed:', text);
      },
      onError: (error) => {
        console.error('Speech error:', error);
      },
    });
  } catch (error) {
    console.error('Text-to-speech error:', error);
  }
};

export const accessibilityStop = async () => {
  try {
    await Speech.stop();
  } catch (error) {
    console.warn('Error stopping speech:', error);
  }
};
