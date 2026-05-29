import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "AIzaSyDXUz5UbM7abSxxZyyHuWDAK3ztXLjX0Kk",
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "hackfox.firebaseapp.com",
  databaseURL: process.env.EXPO_PUBLIC_FIREBASE_DATABASE_URL || "https://hackfox-default-rtdb.firebaseio.com",
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "hackfox",
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || "hackfox.firebasestorage.app",
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "787188013088",
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || "1:787188013088:web:a682b0301fd99a26cc0445"
};

// Inicializamos Firebase
const app = initializeApp(firebaseConfig);

// Configurar Auth con persistencia para React Native
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

// Exportamos las instancias para usarlas en la app
export const rtdb = getDatabase(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);
