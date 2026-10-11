import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Card from '@/components/Card';
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

export default function DriverDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { getDriverById } = useAuth();

  const [driver, setDriver] = useState<SessionUser | null | undefined>(undefined);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (!id) {
        setDriver(null);
        return;
      }
      getDriverById(id).then(setDriver);
    }, 0);
    return () => clearTimeout(timeoutId);
  }, [id, getDriverById]);

  if (driver === undefined) {
    return (
      <View style={styles.outerContainer}>
        <View style={[styles.container, styles.centered]}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  if (driver === null) {
    return (
      <View style={styles.outerContainer}>
        <View style={[styles.container, styles.centered]}>
          <Ionicons name="alert-circle-outline" size={32} color={colors.textMuted} />
          <Text style={styles.notFoundTitle}>Mototaxista no encontrado</Text>
          <Text style={styles.notFoundText}>
            Esta cuenta ya no está disponible o el enlace es inválido.
          </Text>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={16} color={colors.secondary} />
            <Text style={styles.backButtonText}>Volver</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.outerContainer}>
      <View style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Tarjeta del Mototaxista */}
          <Card style={styles.profileCard}>
            <View style={styles.avatarSection}>
              <View style={styles.avatarWrap}>
                <Text style={styles.avatarInitials}>{getInitials(driver.name)}</Text>
                <View style={styles.verifiedBadge}>
                  <Ionicons name="shield-checkmark" size={14} color="#FFFFFF" />
                </View>
              </View>

              <Text style={styles.driverName}>{driver.name}</Text>
              <Text style={styles.driverLocation}>Riohacha, La Guajira · Mototaxista MotoYa</Text>

              <View style={styles.ratingBadgeRow}>
                <View style={styles.starsPill}>
                  <Ionicons name="star" size={14} color="#D97706" />
                  <Text style={styles.starsText}>Nuevo</Text>
                </View>
                <Text style={styles.tripsCount}>Aún sin carreras registradas</Text>
              </View>
            </View>

            {/* Cuadro del Parámetro Dinámico [id] */}
            <View style={styles.idBox}>
              <Text style={styles.idLabel}>CÓDIGO DE CONDUCTOR VERIFICADO</Text>
              <Text style={styles.idValue}>{driver.id}</Text>
              <Text style={styles.idHint}>Teléfono de contacto: {driver.phone}</Text>
            </View>

            {/* Ficha Técnica de la Motocicleta */}
            <View style={styles.sectionHeader}>
              <Ionicons name="bicycle" size={16} color={colors.primaryDark} />
              <Text style={styles.sectionTitle}>MOTOCICLETA REGISTRADA</Text>
            </View>

            <View style={styles.motoGrid}>
              <View style={styles.motoCol}>
                <Text style={styles.motoLabel}>MODELO</Text>
                <Text style={styles.motoVal}>{driver.motoModel ?? 'No especificado'}</Text>
              </View>
              <View style={styles.motoCol}>
                <Text style={styles.motoLabel}>PLACA COLOMBIA</Text>
                {driver.plate ? (
                  <View style={styles.plateContainer}>
                    <Text style={styles.plateText}>{driver.plate}</Text>
                  </View>
                ) : (
                  <Text style={styles.motoVal}>No especificada</Text>
                )}
              </View>
            </View>

            {/* Acciones de Contacto */}
            <View style={styles.actionRow}>
              <Pressable
                style={styles.actionCallBtn}
                onPress={() => router.push(`/trip/${driver.id}`)}
              >
                <Ionicons name="flash" size={18} color="#FFFFFF" />
                <Text style={styles.actionCallBtnText}>Iniciar Carrera con {driver.name}</Text>
              </Pressable>
            </View>
          </Card>

          {/* Botón de retorno */}
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={16} color={colors.secondary} />
            <Text style={styles.backButtonText}>Volver a las ofertas</Text>
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
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 24,
  },
  notFoundTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: colors.textPrimary,
    marginTop: 4,
  },
  notFoundText: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  profileCard: {
    padding: 18,
    ...shadow.glow,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarWrap: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.primary,
    marginBottom: 10,
  },
  avatarInitials: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '900',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  driverName: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.textPrimary,
  },
  driverLocation: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  ratingBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  starsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.accentSoft,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  starsText: {
    fontSize: 12,
    fontWeight: '900',
    color: colors.accentDark,
  },
  tripsCount: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '600',
  },
  idBox: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
  },
  idLabel: {
    fontSize: 9,
    fontWeight: '900',
    color: colors.textMuted,
    letterSpacing: 0.8,
  },
  idValue: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.primaryDark,
    letterSpacing: 1,
    marginVertical: 2,
  },
  idHint: {
    fontSize: 10,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: colors.textSecondary,
    letterSpacing: 0.6,
  },
  motoGrid: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    padding: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  motoCol: {
    width: '46%',
  },
  motoLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.textMuted,
  },
  motoVal: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 2,
  },
  plateContainer: {
    backgroundColor: '#FEF08A',
    borderWidth: 1,
    borderColor: '#EAB308',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.xs,
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  plateText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#713F12',
  },
  actionRow: {
    marginTop: 6,
  },
  actionCallBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: radius.md,
    ...shadow.glow,
  },
  actionCallBtnText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FFFFFF',
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
