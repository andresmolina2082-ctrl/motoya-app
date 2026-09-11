import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, shadow } from '@/theme';

type Props = {
  fare: number;
  onFareChange: (newFare: number) => void;
  minFare?: number;
};

export default function FareCounter({
  fare,
  onFareChange,
  minFare = 2000,
}: Props) {
  const formatCOP = (val: number) => `$${val.toLocaleString('es-CO')}`;

  const adjust = (delta: number) => {
    const next = Math.max(minFare, fare + delta);
    onFareChange(next);
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.titleWithIcon}>
          <Ionicons name="cash-outline" size={18} color={colors.primary} />
          <Text style={styles.label}>TU OFERTA DE TARIFA</Text>
        </View>
        <Text style={styles.tag}>NEGOCIABLE</Text>
      </View>

      {/* Contador Central */}
      <View style={styles.counterRow}>
        <Pressable
          style={[styles.btnCircle, fare <= minFare && styles.btnDisabled]}
          onPress={() => adjust(-500)}
          disabled={fare <= minFare}
        >
          <Ionicons
            name="remove"
            size={22}
            color={fare <= minFare ? colors.textMuted : colors.textPrimary}
          />
        </Pressable>

        <View style={styles.fareDisplay}>
          <Text style={styles.fareAmount}>{formatCOP(fare)}</Text>
          <Text style={styles.currency}>COP (Pesos)</Text>
        </View>

        <Pressable style={styles.btnCircle} onPress={() => adjust(500)}>
          <Ionicons name="add" size={22} color={colors.primaryDark} />
        </Pressable>
      </View>

      {/* Botones de incremento rápido */}
      <View style={styles.quickIncrements}>
        <Text style={styles.quickLabel}>Sumar rápido:</Text>
        <Pressable style={styles.quickChip} onPress={() => adjust(500)}>
          <Text style={styles.quickChipText}>+$500</Text>
        </Pressable>
        <Pressable style={styles.quickChip} onPress={() => adjust(1000)}>
          <Text style={styles.quickChipText}>+$1.000</Text>
        </Pressable>
        <Pressable style={styles.quickChip} onPress={() => adjust(2000)}>
          <Text style={styles.quickChipText}>+$2.000</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.card,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  label: {
    fontSize: 11,
    fontWeight: '900',
    color: colors.textSecondary,
    letterSpacing: 0.6,
  },
  tag: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.primaryDark,
    backgroundColor: colors.primarySubtle,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  btnCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnDisabled: {
    opacity: 0.4,
  },
  fareDisplay: {
    alignItems: 'center',
  },
  fareAmount: {
    fontSize: 34,
    fontWeight: '900',
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  currency: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '600',
    marginTop: 2,
  },
  quickIncrements: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  quickLabel: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '600',
  },
  quickChip: {
    backgroundColor: colors.primarySubtle,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  quickChipText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.primaryDark,
  },
});
