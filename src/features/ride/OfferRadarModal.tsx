import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Card from '@/components/Card';
import Badge from '@/components/Badge';
import { colors, radius, shadow } from '@/theme';

const DRIVER_BIDS = [
  {
    id: 'DRV-101',
    name: 'Jader Gómez',
    moto: 'Bajaj Boxer CT 100',
    plate: 'QWE-45F',
    rating: '4.9',
    trips: '1.420',
    bidFare: 3500,
    eta: '2 min',
    isAccepted: true, // Aceptó el precio propuesto por el usuario
    tripId: 'TRP-301',
    distance: '350 m',
  },
  {
    id: 'DRV-102',
    name: 'Maikel Redondo',
    moto: 'Suzuki GN 125',
    plate: 'RTY-12C',
    rating: '4.8',
    trips: '890',
    bidFare: 4000,
    eta: '1 min',
    isAccepted: false, // Contraoferta
    tripId: 'TRP-302',
    distance: '180 m (¡Muy cerca!)',
  },
  {
    id: 'DRV-103',
    name: 'Wilmer Epieyú',
    moto: 'Yamaha YBR 125',
    plate: 'UIO-89E',
    rating: '5.0',
    trips: '510',
    bidFare: 3500,
    eta: '3 min',
    isAccepted: true,
    tripId: 'TRP-303',
    distance: '600 m',
  },
];

export default function OfferRadarModal() {
  const router = useRouter();

  const handleAcceptBid = (tripId: string) => {
    // Navegación programática hacia el seguimiento de la carrera activa
    router.push(`/trip/${tripId}`);
  };

  const handleViewProfile = (driverId: string) => {
    // Navegación programática hacia la ruta dinámica del conductor
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
              <Ionicons name="radio" size={24} color={colors.primary} />
            </View>
            <View style={styles.radarHeaderContent}>
              <View style={styles.radarTitleRow}>
                <Text style={styles.radarTitle}>Radar de Ofertas en Vivo</Text>
                <Badge text="BUSCANDO" color={colors.primary} />
              </View>
              <Text style={styles.radarSubtitle}>
                3 mototaxistas cercanos han respondido a tu solicitud
              </Text>
            </View>
          </View>

          {/* Tarjetas de Ofertas Entrantes (estilo inDriver) */}
          <View style={styles.bidsList}>
            {DRIVER_BIDS.map((bid) => (
              <Card key={bid.id} style={styles.bidCard}>
                {/* Fila superior: Conductor y Tarifa */}
                <View style={styles.bidTopRow}>
                  <View style={styles.driverInfoCol}>
                    <View style={styles.driverHeaderRow}>
                      <View style={styles.driverAvatar}>
                        <Text style={styles.driverAvatarText}>
                          {bid.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')}
                        </Text>
                      </View>
                      <View>
                        <View style={styles.nameRow}>
                          <Text style={styles.driverName}>{bid.name}</Text>
                          <Ionicons name="checkmark-circle" size={14} color={colors.primary} />
                        </View>
                        <View style={styles.ratingRow}>
                          <Ionicons name="star" size={12} color={colors.accent} />
                          <Text style={styles.ratingText}>
                            {bid.rating} · ({bid.trips} carreras)
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>

                  {/* Tarifa Ofertada */}
                  <View style={styles.fareCol}>
                    <Text style={styles.fareAmount}>
                      ${bid.bidFare.toLocaleString('es-CO')}
                    </Text>
                    {bid.isAccepted ? (
                      <Badge text="ACEPTÓ TU OFERTA" color={colors.primary} />
                    ) : (
                      <Badge text="CONTRAOFERTA" color={colors.accentDark} />
                    )}
                  </View>
                </View>

                {/* Detalles de la Moto y Llegada */}
                <View style={styles.motoDetailBox}>
                  <View style={styles.motoItem}>
                    <Ionicons name="bicycle" size={15} color={colors.primaryDark} />
                    <Text style={styles.motoName}>{bid.moto}</Text>
                    <View style={styles.plateBadge}>
                      <Text style={styles.plateText}>{bid.plate}</Text>
                    </View>
                  </View>

                  <View style={styles.etaItem}>
                    <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
                    <Text style={styles.etaText}>
                      Llega en <Text style={styles.etaBold}>{bid.eta}</Text> ({bid.distance})
                    </Text>
                  </View>
                </View>

                {/* Botones de Acción */}
                <View style={styles.actionButtonsRow}>
                  {/* Botón ver perfil (Ruta Dinámica) */}
                  <Pressable
                    style={styles.profileBtn}
                    onPress={() => handleViewProfile(bid.id)}
                  >
                    <Ionicons name="person-circle-outline" size={16} color={colors.secondary} />
                    <Text style={styles.profileBtnText}>Ver Moto</Text>
                  </Pressable>

                  {/* Botón aceptar carrera (Inicia viaje) */}
                  <Pressable
                    style={styles.acceptBtn}
                    onPress={() => handleAcceptBid(bid.tripId)}
                  >
                    <Ionicons name="checkmark" size={18} color="#FFFFFF" />
                    <Text style={styles.acceptBtnText}>
                      Aceptar por ${bid.bidFare.toLocaleString('es-CO')}
                    </Text>
                  </Pressable>
                </View>
              </Card>
            ))}
          </View>

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
  etaBold: {
    fontWeight: '800',
    color: colors.textPrimary,
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
