import React from 'react';
import { View, Text } from 'react-native';

export const MapView = React.forwardRef((props: any, ref: any) => (
  <View style={[{ backgroundColor: '#e0e0e0', justifyContent: 'center', alignItems: 'center' }, props.style]}>
    <Text style={{ color: '#666', fontSize: 16 }}>El mapa no está disponible en la versión web.</Text>
  </View>
));

export const Marker = (props: any) => null;
