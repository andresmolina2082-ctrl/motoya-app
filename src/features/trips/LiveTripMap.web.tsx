import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius } from '@/theme';

export default function LiveTripMap() {
  return (
    <View style={styles.mapContainer}>
      <Ionicons name="map-outline" size={28} color={colors.textMuted} />
      <Text style={styles.fallbackText}>
        El mapa en vivo está disponible en la app móvil (Android/iOS)
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  mapContainer: {
    height: 220,
    borderRadius: radius.md,
    marginBottom: 16,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
  },
  fallbackText: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
