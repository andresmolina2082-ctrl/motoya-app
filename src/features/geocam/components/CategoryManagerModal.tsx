import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GeoCamCategory } from '../types';
import { colors, radius, shadow } from '@/theme';

interface CategoryManagerModalProps {
  visible: boolean;
  categories: (GeoCamCategory & { count?: number })[];
  onClose: () => void;
  onAddCategory: (category: {
    name: string;
    color: string;
    icon: string;
    description?: string;
  }) => Promise<void>;
  onDeleteCategory: (id: number) => Promise<void>;
}

const AVAILABLE_COLORS = [
  '#00C853', // Verde principal
  '#0284C7', // Azul
  '#EF4444', // Rojo
  '#F59E0B', // Ámbar
  '#8B5CF6', // Morado
  '#06B6D4', // Cian
  '#EC4899', // Rosa
  '#475569', // Pizarra
];

const AVAILABLE_ICONS: (keyof typeof Ionicons.glyphMap)[] = [
  'shield-checkmark',
  'location',
  'alert-circle',
  'document-text',
  'navigate',
  'camera',
  'bicycle',
  'car',
  'construct',
  'flag',
];

export function CategoryManagerModal({
  visible,
  categories,
  onClose,
  onAddCategory,
  onDeleteCategory,
}: CategoryManagerModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedColor, setSelectedColor] = useState(AVAILABLE_COLORS[0]);
  const [selectedIcon, setSelectedIcon] = useState<string>(AVAILABLE_ICONS[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) {
      Alert.alert('Nombre Requerido', 'Por favor ingresa un nombre para la categoría.');
      return;
    }

    try {
      setIsSubmitting(true);
      await onAddCategory({
        name: name.trim(),
        color: selectedColor,
        icon: selectedIcon,
        description: description.trim() || undefined,
      });
      setName('');
      setDescription('');
    } catch (error) {
      console.warn('Error al crear categoría:', error);
      Alert.alert('Error', 'Ya existe una categoría con ese nombre o hubo un error.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (cat: GeoCamCategory & { count?: number }) => {
    if (cat.id === 1) {
      Alert.alert('Protegida', 'La categoría general por defecto no puede ser eliminada.');
      return;
    }

    Alert.alert(
      'Eliminar Categoría',
      `¿Deseas eliminar "${cat.name}"? Las capturas asociadas serán reasignadas a la categoría General.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => onDeleteCategory(cat.id),
        },
      ],
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.closeBtn} onPress={onClose}>
            <Ionicons name="close" size={24} color={colors.textPrimary} />
          </Pressable>
          <Text style={styles.headerTitle}>Gestión de Categorías</Text>
          <View style={{ width: 32 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Formulario para Crear Categoría */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>+ Nueva Categoría (Entidad Relacionada)</Text>

            <Text style={styles.inputLabel}>Nombre de Categoría</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Ej: Control de Velocidad / Paradero Norte"
              placeholderTextColor={colors.textMuted}
              value={name}
              onChangeText={setName}
            />

            <Text style={styles.inputLabel}>Color Distintivo</Text>
            <View style={styles.colorPalette}>
              {AVAILABLE_COLORS.map((color) => (
                <Pressable
                  key={color}
                  style={[
                    styles.colorCircle,
                    { backgroundColor: color },
                    selectedColor === color && styles.colorCircleSelected,
                  ]}
                  onPress={() => setSelectedColor(color)}
                >
                  {selectedColor === color && (
                    <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                  )}
                </Pressable>
              ))}
            </View>

            <Text style={styles.inputLabel}>Icono</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.iconScroll}>
              {AVAILABLE_ICONS.map((icon) => (
                <Pressable
                  key={icon}
                  style={[
                    styles.iconBox,
                    selectedIcon === icon && {
                      borderColor: selectedColor,
                      backgroundColor: `${selectedColor}15`,
                    },
                  ]}
                  onPress={() => setSelectedIcon(icon)}
                >
                  <Ionicons
                    name={icon}
                    size={20}
                    color={selectedIcon === icon ? selectedColor : colors.textSecondary}
                  />
                </Pressable>
              ))}
            </ScrollView>

            <Text style={styles.inputLabel}>Descripción (Opcional)</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Breve propósito de esta categoría..."
              placeholderTextColor={colors.textMuted}
              value={description}
              onChangeText={setDescription}
            />

            <Pressable
              style={[styles.addBtn, isSubmitting && styles.btnDisabled]}
              onPress={handleCreate}
              disabled={isSubmitting}
            >
              <Ionicons name="add-circle-outline" size={18} color="#FFFFFF" />
              <Text style={styles.addBtnText}>Crear Categoría en SQLite</Text>
            </Pressable>
          </View>

          {/* Lista de Categorías Existentes */}
          <Text style={styles.listHeader}>Categorías Registradas ({categories.length})</Text>

          {categories.map((cat) => {
            const catIcon = (cat.icon as keyof typeof Ionicons.glyphMap) || 'folder';
            return (
              <View key={cat.id} style={styles.catItem}>
                <View style={[styles.catBadge, { backgroundColor: cat.color }]}>
                  <Ionicons name={catIcon} size={16} color="#FFFFFF" />
                </View>

                <View style={styles.catInfo}>
                  <View style={styles.catTitleRow}>
                    <Text style={styles.catName}>{cat.name}</Text>
                    {cat.count !== undefined ? (
                      <View style={styles.countBadge}>
                        <Text style={styles.countText}>{cat.count} fotos</Text>
                      </View>
                    ) : null}
                  </View>
                  {cat.description ? (
                    <Text style={styles.catDesc} numberOfLines={2}>
                      {cat.description}
                    </Text>
                  ) : null}
                </View>

                {cat.id !== 1 && (
                  <Pressable
                    style={styles.deleteCatBtn}
                    onPress={() => handleDelete(cat)}
                    hitSlop={8}
                  >
                    <Ionicons name="trash-outline" size={18} color={colors.danger} />
                  </Pressable>
                )}
              </View>
            );
          })}
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
  closeBtn: {
    padding: 6,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 20,
    ...shadow.card,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: 6,
    marginTop: 10,
  },
  textInput: {
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 14,
    color: colors.textPrimary,
  },
  colorPalette: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  colorCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorCircleSelected: {
    borderWidth: 3,
    borderColor: '#0F172A',
  },
  iconScroll: {
    flexDirection: 'row',
    marginHorizontal: -4,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primaryDark,
    paddingVertical: 12,
    borderRadius: radius.sm,
    marginTop: 16,
  },
  addBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  listHeader: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 10,
  },
  catItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 12,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 8,
  },
  catBadge: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  catInfo: {
    flex: 1,
  },
  catTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  catName: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  countBadge: {
    backgroundColor: colors.surfaceAlt,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.xs,
  },
  countText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
  },
  catDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  deleteCatBtn: {
    padding: 8,
  },
});
