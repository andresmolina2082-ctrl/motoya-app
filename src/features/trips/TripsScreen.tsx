import { View, Text, ScrollView, StyleSheet, Platform, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Card from '@/components/Card';
import Badge from '@/components/Badge';
import { colors, radius, shadow } from '@/theme';

const TRIPS_HISTORY = [
  {
    id: 'TRP-301',
    date: 'Hoy, 11:20 AM',
    origin: 'Parque Nicolás de Federmann',
    destination: 'Univ. de La Guajira - Campus Central',
    driver: 'Jader Gómez',
    moto: 'Bajaj Boxer CT 100',
    fare: 3500,
    status: 'EN CURSO',
    statusColor: colors.primary,
    active: true,
  },
  {
    id: 'TRP-208',
    date: 'Ayer, 4:15 PM',
    origin: 'Mercado Viejo Riohacha',
    destination: 'Guajira Plaza Centro Comercial',
    driver: 'Maikel Redondo',
    moto: 'Suzuki GN 125',
    fare: 4000,
    status: 'COMPLETADO',
    statusColor: colors.primaryDark,
    active: false,
  },
  {
    id: 'TRP-195',
    date: '8 Sep, 8:40 AM',
    origin: 'Barrio Coquivacoa',
    destination: 'Terminal de Transportes de Riohacha',
    driver: 'Wilmer Epieyú',
    moto: 'Yamaha YBR 125',
    fare: 5000,
    status: 'COMPLETADO',
    statusColor: colors.primaryDark,
    active: false,
  },
];

export default function TripsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
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

          {/* Listado */}
          <View style={styles.body}>
            {TRIPS_HISTORY.map((trip) => (
              <Card key={trip.id} style={styles.tripCard}>
                <View style={styles.tripHeader}>
                  <Text style={styles.tripDate}>{trip.date}</Text>
                  <Badge text={trip.status} color={trip.statusColor} />
                </View>

                {/* Ruta */}
                <View style={styles.routeContainer}>
                  <View style={styles.iconCol}>
                    <View style={styles.dotOrigin} />
                    <View style={styles.routeLine} />
                    <View style={styles.dotDest} />
                  </View>
                  <View style={styles.pointsCol}>
                    <Text style={styles.pointText}>{trip.origin}</Text>
                    <Text style={styles.pointText}>{trip.destination}</Text>
                  </View>
                </View>

                {/* Conductor y Tarifa */}
                <View style={styles.tripFooter}>
                  <View style={styles.driverInfo}>
                    <Ionicons name="person-circle" size={16} color={colors.secondary} />
                    <Text style={styles.driverText}>
                      {trip.driver} · <Text style={styles.motoText}>{trip.moto}</Text>
                    </Text>
                  </View>
                  <Text style={styles.fareText}>${trip.fare.toLocaleString('es-CO')}</Text>
                </View>

                {/* Botón de monitoreo si está en curso */}
                {trip.active && (
                  <Pressable
                    style={styles.trackButton}
                    onPress={() => router.push(`/trip/${trip.id}`)}
                  >
                    <Ionicons name="navigate" size={16} color="#FFFFFF" />
                    <Text style={styles.trackButtonText}>Ver Carrera en Vivo (Ruta Dinámica)</Text>
                  </Pressable>
                )}
              </Card>
            ))}
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
  tripCard: {
    padding: 16,
  },
  tripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  tripDate: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
  },
  routeContainer: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceAlt,
    padding: 10,
    borderRadius: radius.md,
    marginBottom: 12,
  },
  iconCol: {
    width: 18,
    alignItems: 'center',
    paddingVertical: 4,
  },
  dotOrigin: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  routeLine: {
    width: 2,
    flex: 1,
    backgroundColor: colors.border,
    marginVertical: 4,
  },
  dotDest: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent,
  },
  pointsCol: {
    flex: 1,
    paddingLeft: 8,
    justifyContent: 'space-between',
    height: 48,
  },
  pointText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  tripFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingTop: 10,
  },
  driverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  driverText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  motoText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textMuted,
  },
  fareText: {
    fontSize: 16,
    fontWeight: '900',
    color: colors.primaryDark,
  },
  trackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    paddingVertical: 10,
    borderRadius: radius.md,
    marginTop: 12,
  },
  trackButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },
});
