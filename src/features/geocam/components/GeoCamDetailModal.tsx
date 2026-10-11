import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Linking,
  Platform,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { GeoCam } from '../types';
import { getFileInfo } from '../storage';
import { colors, radius, shadow } from '@/theme';

interface GeoCamDetailModalProps {
  visible: boolean;
  item: GeoCam | null;
  onClose: () => void;
  onEdit: (item: GeoCam) => void;
  onDelete: (item: GeoCam) => void;
}

export function GeoCamDetailModal({
  visible,
  item,
  onClose,
  onEdit,
  onDelete,
}: GeoCamDetailModalProps) {
  const [fileDetails, setFileDetails] = useState<{ exists: boolean; size?: number }>({
    exists: true,
  });

  useEffect(() => {
    if (item?.photo_uri) {
      getFileInfo(item.photo_uri).then(setFileDetails);
    }
  }, [item?.photo_uri]);

  if (!item) return null;

  const categoryColor = item.category_color || colors.primaryDark;
  const categoryName = item.category_name || 'General';
  const categoryIcon = (item.category_icon as keyof typeof Ionicons.glyphMap) || 'camera';

  const handleOpenMaps = () => {
    const url = Platform.select({
      ios: `maps://app?saddr=&daddr=${item.latitude},${item.longitude}`,
      default: `https://www.google.com/maps/search/?api=1&query=${item.latitude},${item.longitude}`,
    });
    Linking.openURL(url).catch((err) => console.warn('No se pudo abrir el mapa:', err));
  };

  const formattedCreated = new Date(item.created_at).toLocaleString('es-CO');
  const formattedUpdated = new Date(item.updated_at).toLocaleString('es-CO');

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.closeButton} onPress={onClose} hitSlop={10}>
            <Ionicons name="close" size={24} color={colors.textPrimary} />
          </Pressable>
          <Text style={styles.headerTitle} numberOfLines={1}>
            Detalle de GeoCam
          </Text>
          <View style={styles.headerActions}>
            <Pressable
              style={styles.headerActionBtn}
              onPress={() => {
                onClose();
                onEdit(item);
              }}
            >
              <Ionicons name="pencil" size={20} color={colors.info} />
            </Pressable>
            <Pressable
              style={[styles.headerActionBtn, styles.deleteBtn]}
              onPress={() => {
                onClose();
                onDelete(item);
              }}
            >
              <Ionicons name="trash-outline" size={20} color={colors.danger} />
            </Pressable>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Fotografía de gran tamaño */}
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: item.photo_uri }}
              style={styles.image}
              contentFit="cover"
              transition={300}
            />
            {/* Badge de categoría */}
            <View style={[styles.categoryBadge, { backgroundColor: categoryColor }]}>
              <Ionicons name={categoryIcon} size={14} color="#FFFFFF" />
              <Text style={styles.categoryBadgeText}>{categoryName}</Text>
            </View>
          </View>

          {/* Título y descripción */}
          <View style={styles.section}>
            <Text style={styles.title}>{item.title}</Text>
            {item.description ? (
              <Text style={styles.description}>{item.description}</Text>
            ) : (
              <Text style={styles.noDescription}>Sin descripción adicional</Text>
            )}
          </View>

          {/* Sección de Geolocalización */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="location" size={20} color={colors.primary} />
              <Text style={styles.cardTitle}>Geolocalización GPS</Text>
            </View>

            <View style={styles.coordsGrid}>
              <View style={styles.coordItem}>
                <Text style={styles.coordLabel}>Latitud</Text>
                <Text style={styles.coordValue}>{item.latitude.toFixed(6)}</Text>
              </View>
              <View style={styles.coordItem}>
                <Text style={styles.coordLabel}>Longitud</Text>
                <Text style={styles.coordValue}>{item.longitude.toFixed(6)}</Text>
              </View>
            </View>

            {item.address ? (
              <View style={styles.addressRow}>
                <Ionicons name="navigate-outline" size={16} color={colors.textSecondary} />
                <Text style={styles.addressText}>{item.address}</Text>
              </View>
            ) : null}

            <Pressable style={styles.mapsButton} onPress={handleOpenMaps}>
              <Ionicons name="map-outline" size={18} color="#FFFFFF" />
              <Text style={styles.mapsButtonText}>Abrir en Google Maps</Text>
            </Pressable>
          </View>

          {/* Sección de Almacenamiento Permanente */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="save-outline" size={20} color={colors.info} />
              <Text style={styles.cardTitle}>Almacenamiento Permanente</Text>
            </View>

            <Text style={styles.fileLabel}>Ruta física del archivo:</Text>
            <View style={styles.filePathBox}>
              <Text style={styles.filePathText} selectable>
                {item.photo_uri}
              </Text>
            </View>

            <View style={styles.fileStats}>
              <Text style={styles.fileStatText}>
                Estado en disco:{' '}
                <Text style={{ fontWeight: '800', color: fileDetails.exists ? colors.primaryDark : colors.danger }}>
                  {fileDetails.exists ? '✓ Archivo presente y persistente' : '✗ No encontrado'}
                </Text>
              </Text>
              {fileDetails.size ? (
                <Text style={styles.fileStatText}>
                  Tamaño: {(fileDetails.size / 1024).toFixed(1)} KB
                </Text>
              ) : null}
            </View>
          </View>

          {/* Metadatos y Auditoría */}
          <View style={styles.metaCard}>
            <Text style={styles.metaItem}>ID en Base de Datos: #{item.id}</Text>
            <Text style={styles.metaItem}>Fecha de Captura: {formattedCreated}</Text>
            <Text style={styles.metaItem}>Última Modificación: {formattedUpdated}</Text>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.select({ ios: 54, default: 20 }),
    paddingBottom: 14,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  closeButton: {
    padding: 6,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerActionBtn: {
    padding: 8,
    borderRadius: radius.xs,
    backgroundColor: colors.surfaceAlt,
  },
  deleteBtn: {
    backgroundColor: colors.dangerSoft,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  imageContainer: {
    width: '100%',
    height: 280,
    backgroundColor: colors.surfaceAlt,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  categoryBadge: {
    position: 'absolute',
    bottom: 14,
    left: 14,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
    gap: 6,
    ...shadow.sm,
  },
  categoryBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  section: {
    padding: 16,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  description: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  noDescription: {
    fontSize: 14,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
  card: {
    marginHorizontal: 16,
    marginTop: 14,
    padding: 16,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.card,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  coordsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  coordItem: {
    flex: 1,
    backgroundColor: colors.primarySubtle,
    padding: 10,
    borderRadius: radius.sm,
  },
  coordLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primaryDark,
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  coordValue: {
    fontSize: 14,
    fontWeight: '900',
    color: colors.textPrimary,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  addressText: {
    fontSize: 13,
    color: colors.textSecondary,
    flex: 1,
  },
  mapsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primaryDark,
    paddingVertical: 12,
    borderRadius: radius.sm,
  },
  mapsButtonText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
  fileLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: 6,
  },
  filePathBox: {
    backgroundColor: colors.surfaceAlt,
    padding: 10,
    borderRadius: radius.xs,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 10,
  },
  filePathText: {
    fontSize: 11,
    fontFamily: Platform.select({ ios: 'Courier', default: 'monospace' }),
    color: colors.textSecondary,
  },
  fileStats: {
    gap: 4,
  },
  fileStatText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  metaCard: {
    marginHorizontal: 16,
    marginTop: 14,
    padding: 12,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.sm,
    gap: 4,
  },
  metaItem: {
    fontSize: 12,
    color: colors.textMuted,
  },
});
