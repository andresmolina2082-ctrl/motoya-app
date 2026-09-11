import { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Switch, Pressable, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Card from '@/components/Card';
import Badge from '@/components/Badge';
import { colors, radius, shadow } from '@/theme';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const topPadding = Math.max(insets.top, Platform.OS === 'web' ? 16 : 24);
  const [driverMode, setDriverMode] = useState(false);

  return (
    <View style={styles.outerContainer}>
      <View style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={[styles.hero, { paddingTop: topPadding }]}>
            <View style={styles.profileHeaderRow}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>AM</Text>
              </View>
              <View>
                <Text style={styles.userName}>Andrés Molina</Text>
                <Text style={styles.userLocation}>Riohacha · La Guajira 📍</Text>
                <View style={styles.ratingBadge}>
                  <Ionicons name="star" size={12} color={colors.accent} />
                  <Text style={styles.ratingText}>4.95 Pasajero Confiable</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Cuerpo */}
          <View style={styles.body}>
            {/* Modo Conductor Switch */}
            <Card style={styles.driverSwitchCard}>
              <View style={styles.switchRow}>
                <View style={styles.switchIcon}>
                  <Ionicons name="bicycle" size={20} color={colors.primaryDark} />
                </View>
                <View style={styles.switchTextCol}>
                  <Text style={styles.switchTitle}>Modo Mototaxista</Text>
                  <Text style={styles.switchSub}>
                    {driverMode
                      ? 'Estás recibiendo ofertas de carreras'
                      : '¿Tienes moto? Genera ingresos en tus ratos libres'}
                  </Text>
                </View>
                <Switch
                  value={driverMode}
                  onValueChange={setDriverMode}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor="#FFFFFF"
                />
              </View>
            </Card>

            {/* Billetera y Métodos de Pago */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>BILLETERA & MEDIOS DE PAGO</Text>
            </View>

            <Card style={styles.walletCard}>
              <View style={styles.paymentMethodItem}>
                <View style={[styles.methodIcon, { backgroundColor: '#FDF2F8' }]}>
                  <Text style={{ fontSize: 16 }}>📲</Text>
                </View>
                <View style={styles.methodInfo}>
                  <Text style={styles.methodName}>Nequi</Text>
                  <Text style={styles.methodDetail}>Vinculado (***-8291)</Text>
                </View>
                <Badge text="PREDETERMINADO" color={colors.primaryDark} />
              </View>

              <View style={styles.methodDivider} />

              <View style={styles.paymentMethodItem}>
                <View style={[styles.methodIcon, { backgroundColor: '#FEF2F2' }]}>
                  <Text style={{ fontSize: 16 }}>🏦</Text>
                </View>
                <View style={styles.methodInfo}>
                  <Text style={styles.methodName}>Daviplata</Text>
                  <Text style={styles.methodDetail}>Vinculado (***-4012)</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
              </View>

              <View style={styles.methodDivider} />

              <View style={styles.paymentMethodItem}>
                <View style={[styles.methodIcon, { backgroundColor: colors.primarySubtle }]}>
                  <Text style={{ fontSize: 16 }}>💵</Text>
                </View>
                <View style={styles.methodInfo}>
                  <Text style={styles.methodName}>Efectivo</Text>
                  <Text style={styles.methodDetail}>Pago directo al mototaxista</Text>
                </View>
                <Ionicons name="checkmark-circle" size={16} color={colors.primary} />
              </View>
            </Card>

            {/* Seguridad y Preferencias */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>PREFERENCIAS DE SEGURIDAD</Text>
            </View>

            <Card style={styles.safetyCard}>
              <View style={styles.safetyRow}>
                <Ionicons name="shield-checkmark" size={20} color={colors.primary} />
                <View style={styles.safetyTextWrap}>
                  <Text style={styles.safetyTitle}>Verificación de Casco Limpio</Text>
                  <Text style={styles.safetySub}>
                    Exigir gorro desechable e higiénico en cada carrera
                  </Text>
                </View>
                <Ionicons name="toggle" size={24} color={colors.primary} />
              </View>

              <View style={styles.methodDivider} />

              <View style={styles.safetyRow}>
                <Ionicons name="call" size={20} color={colors.info} />
                <View style={styles.safetyTextWrap}>
                  <Text style={styles.safetyTitle}>Línea de Soporte MotoYa</Text>
                  <Text style={styles.safetySub}>Atención inmediata en La Guajira</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
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
    paddingBottom: 32,
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
    ...shadow.glow,
  },
  profileHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
  },
  userName: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  userLocation: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.75)',
    marginTop: 2,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
    alignSelf: 'flex-start',
    marginTop: 6,
  },
  ratingText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  body: {
    paddingHorizontal: 16,
    marginTop: -16,
  },
  driverSwitchCard: {
    padding: 14,
    marginBottom: 16,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  switchIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.primarySubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  switchTextCol: {
    flex: 1,
  },
  switchTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: colors.textPrimary,
  },
  switchSub: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 1,
  },
  sectionHeader: {
    marginBottom: 8,
    paddingHorizontal: 2,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: colors.textSecondary,
    letterSpacing: 0.8,
  },
  walletCard: {
    paddingVertical: 4,
    marginBottom: 16,
  },
  paymentMethodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  methodIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  methodInfo: {
    flex: 1,
  },
  methodName: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  methodDetail: {
    fontSize: 11,
    color: colors.textMuted,
  },
  methodDivider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginHorizontal: 14,
  },
  safetyCard: {
    paddingVertical: 4,
  },
  safetyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  safetyTextWrap: {
    flex: 1,
  },
  safetyTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  safetySub: {
    fontSize: 11,
    color: colors.textMuted,
  },
});
