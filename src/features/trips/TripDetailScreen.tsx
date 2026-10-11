import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Card from '@/components/Card';
import { colors, radius, shadow } from '@/theme';
import { useAuth, type SessionUser } from '@/features/auth/AuthContext';
import LiveTripMap from '@/features/trips/LiveTripMap';

function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

export default function TripDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { getDriverById } = useAuth();
  const safeId = id ?? 'TRP-ACTUAL';

  const [driver, setDriver] = useState<SessionUser | null>(null);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (!id) return;
      getDriverById(id).then(setDriver);
    }, 0);
    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return (
    <View style={styles.outerContainer}>
      <View style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Banner de Verificación de Ruta Dinámica Expo Router */}
          <View style={styles.expoBadgeRow}>
            <Ionicons name="code-slash" size={16} color={colors.primaryDark} />
            <Text style={styles.expoBadgeText}>
              Ruta dinámica: <Text style={styles.expoBadgeBold}>trip/[id].tsx</Text>
            </Text>
          </View>

          {/* Tarjeta de Estado en Vivo */}
          <Card style={styles.liveCard}>
            <View style={styles.liveHeaderRow}>
              <View style={styles.liveTagWrap}>
                <View style={styles.pulseDot} />
                <Text style={styles.liveTagText}>CARRERA EN CURSO</Text>
              </View>
              <Text style={styles.tripIdText}>{safeId}</Text>
            </View>

            {/* PIN de Seguridad obligatorio para abordar */}
            <View style={styles.pinBox}>
              <Text style={styles.pinLabel}>CÓDIGO PIN DE SEGURIDAD</Text>
              <Text style={styles.pinValue}>8421</Text>
              <Text style={styles.pinHint}>
                Díctale este PIN a tu mototaxista antes de subirte
              </Text>
            </View>

            {/* Información del Conductor Asignado */}
            <View style={styles.driverRow}>
              <View style={styles.driverAvatar}>
                <Text style={styles.driverAvatarText}>
                  {driver ? getInitials(driver.name) : '?'}
                </Text>
              </View>
              <View style={styles.driverDetails}>
                <View style={styles.nameRow}>
                  <Text style={styles.driverName}>{driver?.name ?? 'Buscando mototaxista...'}</Text>
                  {driver && (
                    <Ionicons name="shield-checkmark" size={14} color={colors.primary} />
                  )}
                </View>
                {driver && (
                  <Text style={styles.driverMoto}>
                    {driver.motoModel ?? 'Moto registrada'}
                    {driver.plate ? (
                      <>
                        {' · Placa '}
                        <Text style={styles.plateText}>{driver.plate}</Text>
                      </>
                    ) : null}
                  </Text>
                )}
                <View style={styles.etaBadge}>
                  <Ionicons name="time" size={12} color={colors.primaryDark} />
                  <Text style={styles.etaText}>En camino hacia tu punto de recogida</Text>
                </View>
              </View>
            </View>

            {/* Mapa en vivo de la carrera */}
            <LiveTripMap />

            {/* Desglose de la Carrera */}
            <View style={styles.tripBreakdown}>
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>Tarifa acordada (inDriver):</Text>
                <Text style={styles.breakdownValue}>$3.500 COP</Text>
              </View>
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>Método de pago:</Text>
                <Text style={styles.breakdownValue}>Nequi / Efectivo</Text>
              </View>
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>Casco reglamentario:</Text>
                <Text style={[styles.breakdownValue, { color: colors.primary }]}>
                  Listo para ti ✅
                </Text>
              </View>
            </View>

            {/* Botones de Seguridad y Contacto */}
            <View style={styles.securityButtonsCol}>
              <Pressable style={styles.whatsappBtn}>
                <Ionicons name="logo-whatsapp" size={18} color="#FFFFFF" />
                <Text style={styles.whatsappBtnText}>Compartir Carrera en Vivo</Text>
              </Pressable>

              <Pressable style={styles.sosBtn}>
                <Ionicons name="warning" size={18} color={colors.danger} />
                <Text style={styles.sosBtnText}>Botón de Asistencia SOS</Text>
              </Pressable>
            </View>

            {/* Finalizar carrera simulada */}
            <Pressable
              style={styles.finishBtn}
              onPress={() => router.push('/(tabs)/trips')}
            >
              <Text style={styles.finishBtnText}>Completar Carrera y Calificar</Text>
            </Pressable>
          </Card>

          {/* Botón Volver */}
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={16} color={colors.secondary} />
            <Text style={styles.backButtonText}>Volver al menú</Text>
          </Pressable>
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
    padding: 16,
    paddingBottom: 40,
  },
  expoBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.primarySubtle,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.md,
    marginBottom: 14,
  },
  expoBadgeText: {
    fontSize: 12,
    color: colors.primaryDark,
  },
  expoBadgeBold: {
    fontWeight: '800',
  },
  liveCard: {
    padding: 18,
    ...shadow.glow,
  },
  liveHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  liveTagWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0, 200, 83, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  liveTagText: {
    fontSize: 11,
    fontWeight: '900',
    color: colors.primaryDark,
  },
  tripIdText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.textMuted,
  },
  pinBox: {
    backgroundColor: colors.secondary,
    borderRadius: radius.md,
    padding: 14,
    alignItems: 'center',
    marginBottom: 16,
  },
  pinLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: 'rgba(255, 255, 255, 0.7)',
    letterSpacing: 1,
  },
  pinValue: {
    fontSize: 34,
    fontWeight: '900',
    color: colors.primary,
    letterSpacing: 6,
    marginVertical: 4,
  },
  pinHint: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.75)',
    textAlign: 'center',
  },
  driverRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.surfaceAlt,
    padding: 12,
    borderRadius: radius.md,
    marginBottom: 16,
  },
  driverAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  driverAvatarText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 16,
  },
  driverDetails: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  driverName: {
    fontSize: 15,
    fontWeight: '900',
    color: colors.textPrimary,
  },
  driverMoto: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  plateText: {
    fontWeight: '900',
    color: colors.textPrimary,
  },
  etaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  etaText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  tripBreakdown: {
    gap: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.borderLight,
    paddingVertical: 12,
    marginBottom: 16,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  breakdownLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  breakdownValue: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  securityButtonsCol: {
    gap: 10,
    marginBottom: 14,
  },
  whatsappBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#25D366',
    paddingVertical: 12,
    borderRadius: radius.md,
  },
  whatsappBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },
  sosBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.dangerSoft,
    paddingVertical: 10,
    borderRadius: radius.md,
  },
  sosBtnText: {
    color: colors.danger,
    fontSize: 12,
    fontWeight: '800',
  },
  finishBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: radius.md,
    alignItems: 'center',
    ...shadow.sm,
  },
  finishBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 14,
    paddingVertical: 12,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  backButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.secondary,
  },
});
