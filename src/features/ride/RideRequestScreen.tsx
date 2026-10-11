import { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Link, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import Card from '@/components/Card';
import FareCounter from '@/components/FareCounter';
import AddressAutocompleteInput from '@/components/AddressAutocompleteInput';
import { colors, radius, shadow } from '@/theme';
import { useAuth } from '@/features/auth/AuthContext';

const MOTO_TYPES = [
  {
    id: 'standard',
    name: 'Estándar',
    desc: 'Casco certificado',
    icon: 'bicycle' as const,
    multiplier: 0,
  },
  {
    id: 'express',
    name: 'Express',
    desc: 'Sin desvíos',
    icon: 'flash' as const,
    multiplier: 500,
  },
  {
    id: 'cargo',
    name: 'Con Parrilla',
    desc: 'Para maleta/bolsos',
    icon: 'briefcase' as const,
    multiplier: 500,
  },
];

export default function RideRequestScreen() {
  const insets = useSafeAreaInsets();
  const topPadding = Math.max(insets.top, Platform.OS === 'web' ? 16 : 24);
  const { listDrivers } = useAuth();

  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [locatingOrigin, setLocatingOrigin] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [fare, setFare] = useState(3500);
  const [selectedType, setSelectedType] = useState('standard');
  const [paymentMethod, setPaymentMethod] = useState<'efectivo' | 'nequi' | 'daviplata'>('efectivo');
  const [nearbyDriversCount, setNearbyDriversCount] = useState<number | null>(null);

  const detectCurrentLocation = async () => {
    setLocatingOrigin(true);
    setLocationError(null);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationError('Activa el permiso de ubicación o escribe tu dirección');
        return;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      try {
        const [place] = await Location.reverseGeocodeAsync({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        const line = [place?.street, place?.name].filter(Boolean).join(' ');
        const city = place?.city ?? place?.subregion ?? place?.district;
        setOrigin([line, city].filter(Boolean).join(', ') || 'Ubicación actual');
      } catch {
        setOrigin(
          `Ubicación actual (${position.coords.latitude.toFixed(5)}, ${position.coords.longitude.toFixed(5)})`,
        );
      }
    } catch {
      setLocationError('No se pudo obtener tu ubicación, escríbela manualmente');
    } finally {
      setLocatingOrigin(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      detectCurrentLocation();
    }, 0);
    return () => clearTimeout(timeoutId);
  }, []);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      const timeoutId = setTimeout(() => {
        listDrivers().then((drivers) => {
          if (!cancelled) setNearbyDriversCount(drivers.length);
        });
      }, 0);
      return () => {
        cancelled = true;
        clearTimeout(timeoutId);
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );

  return (
    <View style={styles.outerContainer}>
      <View style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header Superior con Identidad MotoYa */}
          <View style={[styles.hero, { paddingTop: topPadding }]}>
            <View style={styles.decorCircle} />

            <View style={styles.topBarRow}>
              <View style={styles.brandRow}>
                <View style={styles.brandBadge}>
                  <Ionicons name="flash" size={16} color="#FFFFFF" />
                </View>
                <View>
                  <Text style={styles.brandTitle}>MotoYa 🏍️</Text>
                  <Text style={styles.brandSub}>Riohacha · La Guajira</Text>
                </View>
              </View>

              <View style={styles.statusPill}>
                <View style={styles.statusDot} />
                <Text style={styles.statusText}>
                  {nearbyDriversCount === null
                    ? 'Buscando motos...'
                    : nearbyDriversCount === 0
                    ? 'Sin motos cerca'
                    : `${nearbyDriversCount} Moto${nearbyDriversCount === 1 ? '' : 's'} Cerca`}
                </Text>
              </View>
            </View>

            <Text style={styles.heroGreeting}>¿A dónde te movemos hoy?</Text>
            <Text style={styles.heroSubGreeting}>
              Propones tu tarifa y viajas seguro con los mejores mototaxistas
            </Text>
          </View>

          {/* Cuerpo interactivo */}
          <View style={styles.body}>
            {/* 1. Selector de Ruta Origen -> Destino */}
            <Card style={styles.routeCard}>
              <View style={styles.routeRow}>
                <View style={styles.routeIconCol}>
                  <View style={styles.originDot} />
                  <View style={styles.routeLine} />
                  <View style={styles.destDot} />
                </View>

                <View style={styles.routeInputsCol}>
                  {/* Origen */}
                  <View style={styles.pointBlock}>
                    <Text style={styles.pointLabel}>PUNTO DE RECOGIDA</Text>
                    <View style={styles.pointInputRow}>
                      <AddressAutocompleteInput
                        style={styles.pointValue}
                        value={origin}
                        onChangeText={setOrigin}
                        onSelectAddress={setOrigin}
                        placeholder={
                          locatingOrigin ? 'Detectando tu ubicación...' : 'Escribe dónde estás'
                        }
                        placeholderTextColor={colors.textMuted}
                      />
                      <Pressable
                        onPress={detectCurrentLocation}
                        disabled={locatingOrigin}
                        hitSlop={8}
                      >
                        {locatingOrigin ? (
                          <ActivityIndicator size="small" color={colors.primaryDark} />
                        ) : (
                          <Ionicons name="locate" size={16} color={colors.primaryDark} />
                        )}
                      </Pressable>
                    </View>
                    {locationError && (
                      <Text style={styles.locationErrorText}>{locationError}</Text>
                    )}
                  </View>

                  <View style={styles.pointDivider} />

                  {/* Destino */}
                  <View style={styles.pointBlock}>
                    <Text style={styles.pointLabel}>DESTINO</Text>
                    <View style={styles.pointInputRow}>
                      <AddressAutocompleteInput
                        style={styles.pointValue}
                        value={destination}
                        onChangeText={setDestination}
                        onSelectAddress={setDestination}
                        placeholder="¿A dónde vas?"
                        placeholderTextColor={colors.textMuted}
                      />
                      <Ionicons name="search" size={16} color={colors.textMuted} />
                    </View>
                  </View>
                </View>
              </View>

              <View style={styles.routeMeta}>
                <View style={styles.metaItem}>
                  <Ionicons name="map-outline" size={14} color={colors.textSecondary} />
                  <Text style={styles.metaText}>4.2 km</Text>
                </View>
                <Text style={styles.metaBullet}>·</Text>
                <View style={styles.metaItem}>
                  <Ionicons name="speedometer-outline" size={14} color={colors.textSecondary} />
                  <Text style={styles.metaText}>~8 min de viaje</Text>
                </View>
              </View>
            </Card>

            {/* 2. Tipo de Moto */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>TIPO DE SERVICIO</Text>
            </View>

            <View style={styles.typesRow}>
              {MOTO_TYPES.map((t) => {
                const isSelected = selectedType === t.id;
                return (
                  <Pressable
                    key={t.id}
                    style={[
                      styles.typeChip,
                      isSelected && styles.typeChipActive,
                    ]}
                    onPress={() => setSelectedType(t.id)}
                  >
                    <Ionicons
                      name={t.icon}
                      size={20}
                      color={isSelected ? '#FFFFFF' : colors.primaryDark}
                    />
                    <Text
                      style={[
                        styles.typeName,
                        isSelected && styles.typeNameActive,
                      ]}
                    >
                      {t.name}
                    </Text>
                    <Text
                      style={[
                        styles.typeDesc,
                        isSelected && styles.typeDescActive,
                      ]}
                    >
                      {t.desc}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* 3. Negociador de Tarifa inDriver */}
            <View style={{ marginTop: 14 }}>
              <FareCounter
                fare={fare}
                onFareChange={(val) => setFare(val)}
                minFare={2500}
              />
            </View>

            {/* 4. Método de Pago */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>MÉTODO DE PAGO</Text>
            </View>

            <View style={styles.paymentRow}>
              <Pressable
                style={[
                  styles.paymentChip,
                  paymentMethod === 'efectivo' && styles.paymentChipActive,
                ]}
                onPress={() => setPaymentMethod('efectivo')}
              >
                <Ionicons
                  name="cash"
                  size={16}
                  color={paymentMethod === 'efectivo' ? colors.primaryDark : colors.textMuted}
                />
                <Text
                  style={[
                    styles.paymentText,
                    paymentMethod === 'efectivo' && styles.paymentTextActive,
                  ]}
                >
                  Efectivo
                </Text>
              </Pressable>

              <Pressable
                style={[
                  styles.paymentChip,
                  paymentMethod === 'nequi' && styles.paymentChipActive,
                ]}
                onPress={() => setPaymentMethod('nequi')}
              >
                <View style={styles.nequiDot} />
                <Text
                  style={[
                    styles.paymentText,
                    paymentMethod === 'nequi' && styles.paymentTextActive,
                  ]}
                >
                  Nequi
                </Text>
              </Pressable>

              <Pressable
                style={[
                  styles.paymentChip,
                  paymentMethod === 'daviplata' && styles.paymentChipActive,
                ]}
                onPress={() => setPaymentMethod('daviplata')}
              >
                <View style={styles.daviplataDot} />
                <Text
                  style={[
                    styles.paymentText,
                    paymentMethod === 'daviplata' && styles.paymentTextActive,
                  ]}
                >
                  Daviplata
                </Text>
              </Pressable>
            </View>

            {/* 5. Botón de Acción Principal (Navegación Declarativa al Modal de Ofertas) */}
            <Link href={{ pathname: '/modal', params: { fare: String(fare) } }} asChild>
              <Pressable style={styles.findButton}>
                <Ionicons name="radio" size={22} color="#FFFFFF" />
                <Text style={styles.findButtonText}>
                  Buscar MotoTaxi por ${fare.toLocaleString('es-CO')}
                </Text>
              </Pressable>
            </Link>
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
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0, 200, 83, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(0, 200, 83, 0.4)',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#69F0AE',
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
  routeCard: {
    padding: 16,
  },
  routeRow: {
    flexDirection: 'row',
  },
  routeIconCol: {
    width: 20,
    alignItems: 'center',
    paddingVertical: 8,
  },
  originDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  routeLine: {
    width: 2,
    flex: 1,
    backgroundColor: colors.border,
    marginVertical: 4,
  },
  destDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.accent,
  },
  routeInputsCol: {
    flex: 1,
    paddingLeft: 10,
  },
  pointBlock: {
    paddingVertical: 4,
  },
  pointLabel: {
    fontSize: 9,
    fontWeight: '900',
    color: colors.textMuted,
    letterSpacing: 0.6,
  },
  pointInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  pointValue: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    flex: 1,
    marginRight: 8,
  },
  pointDivider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginVertical: 6,
  },
  locationErrorText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.danger,
    marginTop: 4,
  },
  routeMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.surfaceAlt,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.md,
    marginTop: 10,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '700',
  },
  metaBullet: {
    color: colors.textMuted,
  },
  sectionHeader: {
    marginTop: 16,
    marginBottom: 8,
    paddingHorizontal: 2,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: colors.textSecondary,
    letterSpacing: 0.8,
  },
  typesRow: {
    flexDirection: 'row',
    gap: 8,
  },
  typeChip: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: 10,
    alignItems: 'center',
    ...shadow.sm,
  },
  typeChipActive: {
    backgroundColor: colors.primaryDark,
    borderColor: colors.primaryDark,
  },
  typeName: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.textPrimary,
    marginTop: 4,
  },
  typeNameActive: {
    color: '#FFFFFF',
  },
  typeDesc: {
    fontSize: 9,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 2,
  },
  typeDescActive: {
    color: 'rgba(255, 255, 255, 0.85)',
  },
  paymentRow: {
    flexDirection: 'row',
    gap: 8,
  },
  paymentChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 10,
    borderRadius: radius.md,
  },
  paymentChipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySubtle,
  },
  paymentText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  paymentTextActive: {
    color: colors.primaryDark,
    fontWeight: '900',
  },
  nequiDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.nequi,
  },
  daviplataDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.daviplata,
  },
  findButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: radius.md,
    marginTop: 20,
    ...shadow.glow,
  },
  findButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.2,
  },
});
