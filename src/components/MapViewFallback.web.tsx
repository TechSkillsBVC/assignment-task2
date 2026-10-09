import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';

export const PROVIDER_GOOGLE = 'google';

export const Marker = ({ onPress, children }: any) => (
  <TouchableOpacity style={styles.marker} onPress={onPress}>
    <Text style={styles.markerText}>📍 Marker</Text>
    {children}
  </TouchableOpacity>
);

export default function MapView({ children, style }: any) {
  return (
    <View style={[styles.mapContainer, style]}>
      <Text style={styles.webNotice}>[ Interactive Map Preview (Web Mode) ]</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  mapContainer: {
    backgroundColor: '#E6F7FF',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    borderWidth: 1,
    borderColor: '#B3E5FF',
    minHeight: 200,
  },
  webNotice: {
    color: '#00A3FF',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  marker: {
    backgroundColor: '#FFF',
    padding: 8,
    borderRadius: 8,
    marginVertical: 4,
    elevation: 2,
  },
  markerText: {
    color: '#4D6F80',
    fontWeight: '600',
  },
});