import { View, Text, ScrollView, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Card from '@/components/Card';
import { colors, radius, shadow } from '@/theme';

export default function TripsScreen() {
  const insets = useSafeAreaInsets();
  const topPadding = Math.max(insets.top, Platform.OS === 'web' ? 16 : 24);

  return (
    <View style={styles.outerContainer}>
      <View style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={[styles.hero, { paddingTop: topPadding }]}>
            <Text style={styles.heroTitle}>Mis Viajes 🛵</Text>
            <Text style={styles.heroSubtitle}>
              Historial de carreras urbanas y solicitudes en La Guajira
            </Text>
          </View>

          {/* Estado vacío: aún no hay viajes reales registrados */}
          <View style={styles.body}>
            <Card style={styles.emptyCard}>
              <Ionicons name="bicycle-outline" size={32} color={colors.textMuted} />
              <Text style={styles.emptyTitle}>Aún no tienes viajes</Text>
              <Text style={styles.emptyText}>
                Cuando aceptes la oferta de un mototaxista desde &ldquo;Pedir Moto&rdquo;, tu
                carrera aparecerá aquí.
              </Text>
            </Card>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
    maxWidth: 500,
    width: '100%',
    alignSelf: 'center',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  hero: {
    backgroundColor: colors.secondary,
    paddingHorizontal: 20,
    paddingBottom: 28,
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
    ...shadow.glow,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  heroSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.75)',
    marginTop: 4,
  },
  body: {
    paddingHorizontal: 16,
    marginTop: -14,
    gap: 12,
  },
  emptyCard: {
    alignItems: 'center',
    padding: 28,
    gap: 6,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: colors.textPrimary,
    marginTop: 4,
  },
  emptyText: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 17,
  },
});
