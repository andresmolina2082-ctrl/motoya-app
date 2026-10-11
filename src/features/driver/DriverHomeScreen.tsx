import { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Switch, Platform, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Card from '@/components/Card';
import { colors, radius, shadow } from '@/theme';
import { useAuth } from '@/features/auth/AuthContext';

export default function DriverHomeScreen() {
  const insets = useSafeAreaInsets();
  const topPadding = Math.max(insets.top, Platform.OS === 'web' ? 16 : 24);
  const { user } = useAuth();
  const [online, setOnline] = useState(false);

  return (
    <View style={styles.outerContainer}>
      <View style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header Superior */}
          <View style={[styles.hero, { paddingTop: topPadding }]}>
            <View style={styles.decorCircle} />

            <View style={styles.topBarRow}>
              <View style={styles.brandRow}>
                <View style={styles.brandBadge}>
                  <Ionicons name="bicycle" size={16} color="#FFFFFF" />
                </View>
                <View>
                  <Text style={styles.brandTitle}>MotoYa Conductor 🏍️</Text>
                  <Text style={styles.brandSub}>Riohacha · La Guajira</Text>
                </View>
              </View>
            </View>

            <Text style={styles.heroGreeting}>Hola, {user?.name?.split(' ')[0]}</Text>
            <Text style={styles.heroSubGreeting}>
              {online
                ? 'Estás en línea. Te avisaremos cuando llegue una solicitud.'
                : 'Actívate para empezar a recibir solicitudes de pasajeros'}
            </Text>
          </View>

          <View style={styles.body}>
            {/* Switch de conexión */}
            <Card style={styles.onlineCard}>
              <View style={styles.onlineRow}>
                <View
                  style={[
                    styles.onlineIcon,
                    online && { backgroundColor: colors.primarySubtle },
                  ]}
                >
                  <Ionicons
                    name={online ? 'radio' : 'radio-outline'}
                    size={20}
                    color={online ? colors.primaryDark : colors.textMuted}
                  />
                </View>
                <View style={styles.onlineTextCol}>
                  <Text style={styles.onlineTitle}>
                    {online ? 'Estás EN LÍNEA' : 'Estás DESCONECTADO'}
                  </Text>
                  <Text style={styles.onlineSub}>
                    {user?.motoModel ?? 'Moto registrada'}
                    {user?.plate ? ` · ${user.plate}` : ''}
                  </Text>
                </View>
                <Switch
                  value={online}
                  onValueChange={setOnline}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor="#FFFFFF"
                />
              </View>
            </Card>

            {/* Estadísticas del día (reales, en cero hasta que haya carreras) */}
            <View style={styles.statsRow}>
              <Card style={styles.statCard}>
                <Ionicons name="bicycle-outline" size={18} color={colors.primaryDark} />
                <Text style={styles.statValue}>0</Text>
                <Text style={styles.statLabel}>Carreras hoy</Text>
              </Card>
              <Card style={styles.statCard}>
                <Ionicons name="cash-outline" size={18} color={colors.primaryDark} />
                <Text style={styles.statValue}>$0</Text>
                <Text style={styles.statLabel}>Ganado hoy</Text>
              </Card>
              <Card style={styles.statCard}>
                <Ionicons name="star-outline" size={18} color={colors.accentDark} />
                <Text style={styles.statValue}>Nuevo</Text>
                <Text style={styles.statLabel}>Calificación</Text>
              </Card>
            </View>

            {/* Estado de búsqueda de solicitudes */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>SOLICITUDES CERCANAS</Text>
            </View>

            {online ? (
              <Card style={styles.waitingCard}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={styles.waitingTitle}>Buscando pasajeros cerca de ti...</Text>
                <Text style={styles.waitingText}>
                  Cuando un pasajero solicite una moto, la oferta aparecerá aquí para que la
                  aceptes.
                </Text>
              </Card>
            ) : (
              <Card style={styles.waitingCard}>
                <Ionicons name="power-outline" size={26} color={colors.textMuted} />
                <Text style={styles.waitingTitle}>Estás desconectado</Text>
                <Text style={styles.waitingText}>
                  Activa el interruptor de arriba para empezar a recibir solicitudes de
                  pasajeros.
                </Text>
              </Card>
            )}
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
    paddingBottom: 36,
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
    overflow: 'hidden',
    ...shadow.glow,
  },
  decorCircle: {
    position: 'absolute',
    top: -50,
    right: -40,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(0, 200, 83, 0.12)',
  },
  topBarRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  brandBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  brandSub: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  heroGreeting: {
    fontSize: 26,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  heroSubGreeting: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.75)',
    marginTop: 4,
    lineHeight: 18,
  },
  body: {
    paddingHorizontal: 16,
    marginTop: -20,
  },
  onlineCard: {
    padding: 14,
  },
  onlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  onlineIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  onlineTextCol: {
    flex: 1,
  },
  onlineTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: colors.textPrimary,
  },
  onlineSub: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 1,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    gap: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '900',
    color: colors.textPrimary,
  },
  statLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.textMuted,
    textAlign: 'center',
  },
  sectionHeader: {
    marginTop: 20,
    marginBottom: 8,
    paddingHorizontal: 2,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: colors.textSecondary,
    letterSpacing: 0.8,
  },
  waitingCard: {
    alignItems: 'center',
    padding: 28,
    gap: 6,
  },
  waitingTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: colors.textPrimary,
    marginTop: 6,
  },
  waitingText: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 17,
  },
});
