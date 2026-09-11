import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Platform,
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Card from '@/components/Card';
import FareCounter from '@/components/FareCounter';
import { colors, radius, shadow } from '@/theme';

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
  const router = useRouter();
  const topPadding = Math.max(insets.top, Platform.OS === 'web' ? 16 : 24);

  const [origin, setOrigin] = useState('Parque Nicolás de Federmann');
  const [destination, setDestination] = useState('Univ. de La Guajira - Campus Central');
  const [fare, setFare] = useState(3500);
  const [selectedType, setSelectedType] = useState('standard');
  const [paymentMethod, setPaymentMethod] = useState<'efectivo' | 'nequi' | 'daviplata'>('efectivo');

  return (
    <View style={styles.outerContainer}>
      <View style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
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
                <Text style={styles.statusText}>18 Motos Cerca</Text>
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
                      <Text style={styles.pointValue} numberOfLines={1}>
                        {origin}
                      </Text>
                      <Ionicons name="locate" size={16} color={colors.primaryDark} />
                    </View>
                  </View>

                  <View style={styles.pointDivider} />

                  {/* Destino */}
                  <View style={styles.pointBlock}>
                    <Text style={styles.pointLabel}>DESTINO</Text>
                    <View style={styles.pointInputRow}>
                      <Text style={styles.pointValue} numberOfLines={1}>
                        {destination}
                      </Text>
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
            <Link href="/modal" asChild>
              <Pressable style={styles.findButton}>
                <Ionicons name="radio" size={22} color="#FFFFFF" />
                <Text style={styles.findButtonText}>
                  Buscar MotoTaxi por ${fare.toLocaleString('es-CO')}
                </Text>
              </Pressable>
            </Link>

            {/* Acceso Rápido a Mototaxista de Confianza */}
            <Card
              onPress={() => router.push('/driver/DRV-101')}
              style={styles.trustDriverCard}
            >
              <View style={styles.trustDriverRow}>
                <View style={styles.trustAvatar}>
                  <Text style={styles.trustAvatarText}>JG</Text>
                </View>
                <View style={styles.trustInfo}>
                  <Text style={styles.trustName}>Jader Gómez (Conductor Favorito)</Text>
                  <Text style={styles.trustMoto}>Bajaj Boxer CT 100 · Placa QWE-45F</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
              </View>
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
  trustDriverCard: {
    marginTop: 14,
    padding: 12,
  },
  trustDriverRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  trustAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trustAvatarText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },
  trustInfo: {
    flex: 1,
  },
  trustName: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  trustMoto: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 1,
  },
});
