import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Card from '@/components/Card';
import Badge from '@/components/Badge';
import { colors, radius, shadow } from '@/theme';

export default function DriverDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const safeId = id ?? 'DRV-GENERAL';

  return (
    <View style={styles.outerContainer}>
      <View style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Banner de Verificación de Expo Router */}
          <View style={styles.expoBadgeRow}>
            <Ionicons name="code-slash" size={16} color={colors.primaryDark} />
            <Text style={styles.expoBadgeText}>
              Ruta dinámica: <Text style={styles.expoBadgeBold}>driver/[id].tsx</Text>
            </Text>
          </View>

          {/* Tarjeta del Mototaxista */}
          <Card style={styles.profileCard}>
            <View style={styles.avatarSection}>
              <View style={styles.avatarWrap}>
                <Text style={styles.avatarInitials}>JG</Text>
                <View style={styles.verifiedBadge}>
                  <Ionicons name="shield-checkmark" size={14} color="#FFFFFF" />
                </View>
              </View>

              <Text style={styles.driverName}>Jader Gómez Epieyú</Text>
              <Text style={styles.driverLocation}>Riohacha, La Guajira · 4 años en MotoYa</Text>

              <View style={styles.ratingBadgeRow}>
                <View style={styles.starsPill}>
                  <Ionicons name="star" size={14} color="#D97706" />
                  <Text style={styles.starsText}>4.9</Text>
                </View>
                <Text style={styles.tripsCount}>1.420 carreras completadas</Text>
              </View>
            </View>

            {/* Cuadro del Parámetro Dinámico [id] */}
            <View style={styles.idBox}>
              <Text style={styles.idLabel}>CÓDIGO DE CONDUCTOR VERIFICADO</Text>
              <Text style={styles.idValue}>{safeId}</Text>
              <Text style={styles.idHint}>
                Parámetro extraído dinámicamente con useLocalSearchParams()
              </Text>
            </View>

            {/* Ficha Técnica de la Motocicleta */}
            <View style={styles.sectionHeader}>
              <Ionicons name="bicycle" size={16} color={colors.primaryDark} />
              <Text style={styles.sectionTitle}>MOTOCICLETA REGISTRADA</Text>
            </View>

            <View style={styles.motoGrid}>
              <View style={styles.motoCol}>
                <Text style={styles.motoLabel}>MODELO</Text>
                <Text style={styles.motoVal}>Bajaj Boxer CT 100</Text>
              </View>
              <View style={styles.motoCol}>
                <Text style={styles.motoLabel}>PLACA COLOMBIA</Text>
                <View style={styles.plateContainer}>
                  <Text style={styles.plateText}>QWE-45F</Text>
                </View>
              </View>
              <View style={styles.motoCol}>
                <Text style={styles.motoLabel}>COLOR / AÑO</Text>
                <Text style={styles.motoVal}>Negro Mate · 2024</Text>
              </View>
              <View style={styles.motoCol}>
                <Text style={styles.motoLabel}>ESTADO MECÁNICO</Text>
                <Badge text="EXCELENTE 10/10" color={colors.primary} />
              </View>
            </View>

            {/* Protocolos de Seguridad y Normativa */}
            <View style={[styles.sectionHeader, { marginTop: 16 }]}>
              <Ionicons name="shield" size={16} color={colors.primaryDark} />
              <Text style={styles.sectionTitle}>SEGURIDAD & DOCUMENTACIÓN</Text>
            </View>

            <View style={styles.securityList}>
              <View style={styles.securityItem}>
                <Ionicons name="checkmark-circle" size={18} color={colors.primary} />
                <View style={styles.securityTextWrap}>
                  <Text style={styles.securityTitle}>2 Cascos Certificados (DOT / ECE)</Text>
                  <Text style={styles.securitySub}>Incluye gorro higiénico para el pasajero</Text>
                </View>
              </View>

              <View style={styles.securityItem}>
                <Ionicons name="checkmark-circle" size={18} color={colors.primary} />
                <View style={styles.securityTextWrap}>
                  <Text style={styles.securityTitle}>SOAT Vigente</Text>
                  <Text style={styles.securitySub}>Seguros del Estado · Vence Noviembre 2026</Text>
                </View>
              </View>

              <View style={styles.securityItem}>
                <Ionicons name="checkmark-circle" size={18} color={colors.primary} />
                <View style={styles.securityTextWrap}>
                  <Text style={styles.securityTitle}>Revisión Tecnomecánica al día</Text>
                  <Text style={styles.securitySub}>CDA Guajira · Certificado vigente</Text>
                </View>
              </View>

              <View style={styles.securityItem}>
                <Ionicons name="checkmark-circle" size={18} color={colors.primary} />
                <View style={styles.securityTextWrap}>
                  <Text style={styles.securityTitle}>Chaleco Reflectivo Reglamentario</Text>
                  <Text style={styles.securitySub}>Cumple norma de tránsito nocturno</Text>
                </View>
              </View>
            </View>

            {/* Acciones de Contacto */}
            <View style={styles.actionRow}>
              <Pressable
                style={styles.actionCallBtn}
                onPress={() => router.push('/trip/TRP-301')}
              >
                <Ionicons name="flash" size={18} color="#FFFFFF" />
                <Text style={styles.actionCallBtnText}>Iniciar Carrera con Jader</Text>
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
    fontSize: 26,
    fontWeight: '900',
    color: colors.primaryDark,
    letterSpacing: 1.5,
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
  securityList: {
    gap: 10,
    marginBottom: 18,
  },
  securityItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  securityTextWrap: {
    flex: 1,
  },
  securityTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  securitySub: {
    fontSize: 10,
    color: colors.textMuted,
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
