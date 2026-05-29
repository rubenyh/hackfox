import React, { createContext, useState, useContext, ReactNode } from 'react';
import { AccessibilityInfo } from 'react-native';
import { accessibilityAnnounce } from '@/utils/accessibility';

interface AccessibilityContextType {
  voiceoverEnabled: boolean;
  setVoiceoverEnabled: (enabled: boolean) => void;
  screenReaderEnabled: boolean;
  setScreenReaderEnabled: (enabled: boolean) => void;
  announce: (text: string) => Promise<void>;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export const AccessibilityProvider = ({ children }: { children: ReactNode }) => {
  const [voiceoverEnabled, setVoiceoverEnabled] = useState(false);
  const [screenReaderEnabled, setScreenReaderEnabled] = useState(false);

  const announce = async (text: string) => {
    try {
      if (voiceoverEnabled) {
        await accessibilityAnnounce(text);
      }
      if (screenReaderEnabled) {
        await AccessibilityInfo.announceForAccessibility(text);
      }
    } catch (error) {
      console.warn('Error announcing text:', error);
    }
  };

  return (
    <AccessibilityContext.Provider
      value={{
        voiceoverEnabled,
        setVoiceoverEnabled,
        screenReaderEnabled,
        setScreenReaderEnabled,
        announce,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within AccessibilityProvider');
  }
  return context;
};
