import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

type Props = {
  onBack: () => void;
  title?: string;
};

export default function Header({ onBack, title = 'Event' }: Props) {
  return (
    <View style={styles.header}>
      <Pressable
        onPress={onBack}
        hitSlop={16}                 
        style={styles.backButton}    
        accessibilityRole="button"
        accessibilityLabel="Go back"
      >
        <Text style={styles.backText}>{'\u2039'} Back</Text>
      </Pressable>
      <Text style={styles.headerTitle}>{title}</Text>
      <View style={{ width: 64 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  backText: { 
    color: '#0ea5e9', 
    fontWeight: '800', 
    fontSize: 16 },

    headerTitle: { 
    color: '#6b7280',
    fontWeight: '700' },
});
