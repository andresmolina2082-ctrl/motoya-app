import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { GeoCam } from '../types';
import { colors, radius, shadow } from '@/theme';

interface GeoCamCardProps {
  item: GeoCam;
  onPress: (item: GeoCam) => void;
  onEdit: (item: GeoCam) => void;
  onDelete: (item: GeoCam) => void;
}

export function GeoCamCard({ item, onPress, onEdit, onDelete }: GeoCamCardProps) {
  const categoryColor = item.category_color || colors.primaryDark;
  const categoryName = item.category_name || 'Sin Categoría';
  const categoryIcon = (item.category_icon as keyof typeof Ionicons.glyphMap) || 'camera';

  const formattedDate = new Date(item.created_at).toLocaleDateString('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={() => onPress(item)}
    >
      {/* Miniatura de la fotografía permanente */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: item.photo_uri }}
          style={styles.image}
          contentFit="cover"
          transition={300}
        />
        {/* Chip de la categoría relacionada */}
        <View style={[styles.categoryBadge, { backgroundColor: categoryColor }]}>
          <Ionicons name={categoryIcon} size={12} color="#FFFFFF" />
          <Text style={styles.categoryText} numberOfLines={1}>
            {categoryName}
          </Text>
        </View>
      </View>

      {/* Contenido textual */}
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>
          {item.title}
        </Text>

        {item.description ? (
          <Text style={styles.description} numberOfLines={2}>
            {item.description}
          </Text>
        ) : null}

        {/* Coordenadas GPS */}
        <View style={styles.gpsRow}>
          <Ionicons name="location" size={14} color={colors.primary} />
          <Text style={styles.gpsText} numberOfLines={1}>
            {item.latitude.toFixed(5)}, {item.longitude.toFixed(5)}
          </Text>
        </View>

        {/* Footer con fecha y acciones rápidas */}
        <View style={styles.footer}>
          <Text style={styles.dateText}>{formattedDate}</Text>

          <View style={styles.actions}>
            <Pressable
              style={({ pressed }) => [styles.actionButton, pressed && styles.actionButtonPressed]}
              hitSlop={8}
              onPress={(e) => {
                e.stopPropagation();
                onEdit(item);
              }}
            >
              <Ionicons name="pencil" size={16} color={colors.info} />
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.actionButton,
                styles.deleteButton,
                pressed && styles.actionButtonPressed,
              ]}
              hitSlop={8}
              onPress={(e) => {
                e.stopPropagation();
                onDelete(item);
              }}
            >
              <Ionicons name="trash-outline" size={16} color={colors.danger} />
            </Pressable>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    ...shadow.card,
  },
  cardPressed: {
    opacity: 0.94,
    transform: [{ scale: 0.995 }],
  },
  imageContainer: {
    width: '100%',
    height: 160,
    backgroundColor: colors.surfaceAlt,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  categoryBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.pill,
    gap: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 3,
  },
  categoryText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  content: {
    padding: 14,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  description: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: 8,
  },
  gpsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primarySubtle,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.xs,
    marginBottom: 10,
  },
  gpsText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingTop: 8,
  },
  dateText: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    padding: 6,
    borderRadius: radius.xs,
    backgroundColor: colors.surfaceAlt,
  },
  deleteButton: {
    backgroundColor: colors.dangerSoft,
  },
  actionButtonPressed: {
    opacity: 0.7,
  },
});
