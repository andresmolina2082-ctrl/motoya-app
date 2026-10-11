import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Card from '@/components/Card';
import Badge from '@/components/Badge';
import { colors, radius, shadow } from '@/theme';
import { useAuth, type SessionUser } from '@/features/auth/AuthContext';

function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

export default function OfferRadarModal() {
  const router = useRouter();
  const { listDrivers } = useAuth();
  const { fare: fareParam } = useLocalSearchParams<{ fare?: string }>();
  const requestedFare = Number(fareParam) || 3500;

  const [drivers, setDrivers] = useState<SessionUser[] | null>(null);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      listDrivers().then(setDrivers);
    }, 0);
    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAcceptBid = (driverId: string) => {
    router.push(`/trip/${driverId}`);
  };

  const handleViewProfile = (driverId: string) => {
    router.push(`/driver/${driverId}`);
  };

  return (
    <View style={styles.outerContainer}>
      <View style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Barra de arrastre táctil */}
          <View style={styles.dragHandleWrap}>
            <View style={styles.dragHandle} />
          </View>

          {/* Header de Búsqueda Activa */}
          <View style={styles.radarHeader}>
            <View style={styles.pulseIconWrap}>
              <Ionicons name="wifi" size={24} color={colors.primary} />
              <Ionicons name="radio" size={24} color={colors.primary} />
            </View>
            <View style={styles.radarHeaderContent}>
              <View style={styles.radarTitleRow}>
                <Text style={styles.radarTitle}>Radar de Ofertas en Vivo</Text>
                <Badge text="BUSCANDO" color={colors.primary} />
              </View>
              <Text style={styles.radarSubtitle}>
                {drivers === null
                  ? 'Buscando mototaxistas registrados...'
                  : drivers.length > 0
                  ? `${drivers.length} mototaxista${drivers.length === 1 ? '' : 's'} disponible${drivers.length === 1 ? '' : 's'} para tu carrera`
                  : 'Aún no hay mototaxistas registrados'}
              </Text>
            </View>
          </View>

          {drivers === null && (
            <View style={styles.emptyState}>
              <ActivityIndicator size="small" color={colors.primary} />
            </View>
          )}

          {drivers !== null && drivers.length === 0 && (
            <Card style={styles.emptyCard}>
              <Ionicons name="bicycle-outline" size={28} color={colors.textMuted} />
              <Text style={styles.emptyTitle}>Sin mototaxistas aún</Text>
              <Text style={styles.emptyText}>
                Cuando un mototaxista cree su cuenta en MotoYa, aparecerá aquí para ofertar por
                tu carrera.
              </Text>
            </Card>
          )}

          {/* Tarjetas de Ofertas Entrantes (estilo inDriver) */}
          {drivers !== null && drivers.length > 0 && (
            <View style={styles.bidsList}>
              {drivers.map((driver) => (
                <Card key={driver.id} style={styles.bidCard}>
                  {/* Fila superior: Conductor y Tarifa */}
                  <View style={styles.bidTopRow}>
                    <View style={styles.driverInfoCol}>
                      <View style={styles.driverHeaderRow}>
                        <View style={styles.driverAvatar}>
                          <Text style={styles.driverAvatarText}>{getInitials(driver.name)}</Text>
                        </View>
                        <View>
                          <View style={styles.nameRow}>
                            <Text style={styles.driverName}>{driver.name}</Text>
                            <Ionicons name="checkmark-circle" size={14} color={colors.primary} />
                          </View>
                          <View style={styles.ratingRow}>
                            <Ionicons name="star" size={12} color={colors.accent} />
                            <Text style={styles.ratingText}>Nuevo en MotoYa</Text>
                          </View>
                        </View>
                      </View>
                    </View>

                    {/* Tarifa Ofertada */}
                    <View style={styles.fareCol}>
                      <Text style={styles.fareAmount}>
                        ${requestedFare.toLocaleString('es-CO')}
                      </Text>
                      <Badge text="ACEPTÓ TU OFERTA" color={colors.primary} />
                    </View>
                  </View>

                  {/* Detalles de la Moto y Llegada */}
                  <View style={styles.motoDetailBox}>
                    <View style={styles.motoItem}>
                      <Ionicons name="bicycle" size={15} color={colors.primaryDark} />
                      <Text style={styles.motoName}>{driver.motoModel ?? 'Moto registrada'}</Text>
                      {driver.plate && (
                        <View style={styles.plateBadge}>
                          <Text style={styles.plateText}>{driver.plate}</Text>
                        </View>
                      )}
                    </View>

                    <View style={styles.etaItem}>
                      <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
                      <Text style={styles.etaText}>Disponible ahora cerca de ti</Text>
                    </View>
                  </View>

                  {/* Botones de Acción */}
                  <View style={styles.actionButtonsRow}>
                    <Pressable
                      style={styles.profileBtn}
                      onPress={() => handleViewProfile(driver.id)}
                    >
                      <Ionicons name="person-circle-outline" size={16} color={colors.secondary} />
                      <Text style={styles.profileBtnText}>Ver Moto</Text>
                    </Pressable>

                    <Pressable
                      style={styles.acceptBtn}
                      onPress={() => handleAcceptBid(driver.id)}
                    >
                      <Ionicons name="checkmark" size={18} color="#FFFFFF" />
                      <Text style={styles.acceptBtnText}>
                        Aceptar por ${requestedFare.toLocaleString('es-CO')}
                      </Text>
                    </Pressable>
                  </View>
                </Card>
              ))}
            </View>
          )}

          {/* Botón para cancelar y volver */}
          <Pressable style={styles.cancelBtn} onPress={() => router.back()}>
            <Text style={styles.cancelBtnText}>Cancelar Solicitud de Carrera</Text>
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
    paddingTop: 8,
    paddingBottom: 40,
  },
  dragHandleWrap: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  dragHandle: {
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.textMuted,
    opacity: 0.4,
  },
  radarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 12,
  },
  pulseIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primarySubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radarHeaderContent: {
    flex: 1,
  },
  radarTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  radarTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: colors.textPrimary,
  },
  radarSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  emptyCard: {
    alignItems: 'center',
    padding: 24,
    gap: 6,
    marginVertical: 8,
  },
  emptyTitle: {
    fontSize: 14,
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
  bidsList: {
    gap: 12,
    marginVertical: 8,
  },
  bidCard: {
    padding: 14,
  },
  bidTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  driverInfoCol: {
    flex: 1,
  },
  driverHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  driverAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  driverAvatarText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 14,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  driverName: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  ratingText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  fareCol: {
    alignItems: 'flex-end',
  },
  fareAmount: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.primaryDark,
    marginBottom: 2,
  },
  motoDetailBox: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    padding: 10,
    gap: 6,
    marginBottom: 12,
  },
  motoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  motoName: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  plateBadge: {
    backgroundColor: '#FEF08A',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: radius.xs,
    borderWidth: 1,
    borderColor: '#EAB308',
  },
  plateText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#713F12',
  },
  etaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  etaText: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  profileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: radius.md,
  },
  profileBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.secondary,
  },
  acceptBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.primary,
    paddingVertical: 10,
    borderRadius: radius.md,
    ...shadow.sm,
  },
  acceptBtnText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  cancelBtn: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 14,
    borderRadius: radius.md,
    alignItems: 'center',
    marginTop: 10,
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.danger,
  },
});
