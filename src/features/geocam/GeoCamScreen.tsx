import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  TextInput,
  RefreshControl,
  Alert,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { Ionicons } from '@expo/vector-icons';
import { GeoCam, GeoCamCategory } from './types';
import {
  getAllGeoCams,
  getCategories,
  createGeoCam,
  updateGeoCam,
  deleteGeoCam,
  createCategory,
  deleteCategory,
  getDatabaseVersion,
} from './geocamDb';
import { GeoCamCard } from './components/GeoCamCard';
import { GeoCamDetailModal } from './components/GeoCamDetailModal';
import { GeoCamFormModal } from './components/GeoCamFormModal';
import { CategoryManagerModal } from './components/CategoryManagerModal';
import { colors, radius, shadow } from '@/theme';

export function GeoCamScreen() {
  const db = useSQLiteContext();

  const [items, setItems] = useState<GeoCam[]>([]);
  const [categories, setCategories] = useState<(GeoCamCategory & { count?: number })[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [dbVersion, setDbVersion] = useState<number>(2);

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Modales
  const [detailItem, setDetailItem] = useState<GeoCam | null>(null);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<GeoCam | null>(null);
  const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false);

  // Carga de datos
  const loadData = useCallback(async () => {
    try {
      const [ver, cats, geocams] = await Promise.all([
        getDatabaseVersion(db),
        getCategories(db),
        getAllGeoCams(db, selectedCategoryId, searchQuery),
      ]);
      setDbVersion(ver);
      setCategories(cats);
      setItems(geocams);
    } catch (error) {
      console.error('[GeoCamScreen] Error cargando datos:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [db, selectedCategoryId, searchQuery]);

  useEffect(() => {
    let isCurrent = true;

    async function fetchData() {
      try {
        const [ver, cats, geocams] = await Promise.all([
          getDatabaseVersion(db),
          getCategories(db),
          getAllGeoCams(db, selectedCategoryId, searchQuery),
        ]);
        if (isCurrent) {
          setDbVersion(ver);
          setCategories(cats);
          setItems(geocams);
          setIsLoading(false);
        }
      } catch (error) {
        if (isCurrent) {
          console.error('[GeoCamScreen] Error cargando datos:', error);
          setIsLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      isCurrent = false;
    };
  }, [db, selectedCategoryId, searchQuery]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadData();
  };

  // CREATE / UPDATE
  const handleSaveItem = async (data: {
    title: string;
    description?: string;
    photo_uri: string;
    latitude: number;
    longitude: number;
    address?: string;
    category_id: number;
  }) => {
    if (editingItem) {
      // UPDATE
      await updateGeoCam(db, editingItem.id, {
        title: data.title,
        description: data.description,
        category_id: data.category_id,
      });
    } else {
      // CREATE
      await createGeoCam(db, {
        title: data.title,
        description: data.description,
        photo_uri: data.photo_uri,
        latitude: data.latitude,
        longitude: data.longitude,
        address: data.address,
        category_id: data.category_id,
      });
    }
    await loadData();
  };

  // DELETE
  const handleDeleteItem = (item: GeoCam) => {
    Alert.alert(
      'Eliminar Captura',
      `¿Estás seguro de eliminar "${item.title}"?\n\nEsta acción eliminará tanto el registro de SQLite como el archivo permanente del sistema de archivos.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar Permanente',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteGeoCam(db, item.id);
              if (detailItem?.id === item.id) {
                setDetailItem(null);
              }
              await loadData();
            } catch (error) {
              console.error('Error al eliminar:', error);
              Alert.alert('Error', 'No se pudo eliminar la captura.');
            }
          },
        },
      ],
    );
  };

  // CATEGORÍAS
  const handleAddCategory = async (catData: {
    name: string;
    color: string;
    icon: string;
    description?: string;
  }) => {
    await createCategory(db, catData);
    await loadData();
  };

  const handleDeleteCategory = async (id: number) => {
    await deleteCategory(db, id);
    if (selectedCategoryId === id) {
      setSelectedCategoryId(null);
    }
    await loadData();
  };

  const handleOpenCreate = () => {
    setEditingItem(null);
    setIsFormVisible(true);
  };

  const handleOpenEdit = (item: GeoCam) => {
    setEditingItem(item);
    setIsFormVisible(true);
  };

  return (
    <View style={styles.container}>
      {/* Header Superior */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <View style={styles.titleRow}>
              <Text style={styles.headerTitle}>GeoCam Persistente</Text>
              {/* Badge de la Segunda Migración */}
              <View style={styles.migrationBadge}>
                <Ionicons name="git-branch-outline" size={12} color="#FFFFFF" />
                <Text style={styles.migrationBadgeText}>SQLite v{dbVersion}</Text>
              </View>
            </View>
            <Text style={styles.headerSubtitle}>
              CRUD completo con relaciones, migración v2 y archivos permanentes
            </Text>
          </View>

          <Pressable
            style={styles.categoriesBtn}
            onPress={() => setIsCategoryModalVisible(true)}
            hitSlop={8}
          >
            <Ionicons name="folder-open-outline" size={20} color={colors.primaryDark} />
          </Pressable>
        </View>

        {/* Buscador */}
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por título, descripción o dirección..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            clearButtonMode="while-editing"
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')} hitSlop={6}>
              <Ionicons name="close-circle" size={16} color={colors.textMuted} />
            </Pressable>
          )}
        </View>

        {/* Barra de Filtros por Categoría (Relaciones) */}
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={[{ id: null, name: 'Todas', color: colors.primaryDark }, ...categories]}
          keyExtractor={(item) => (item.id === null ? 'all' : `cat-${item.id}`)}
          contentContainerStyle={styles.categoryFiltersContainer}
          renderItem={({ item: cat }) => {
            const isSelected = selectedCategoryId === cat.id;
            return (
              <Pressable
                style={[
                  styles.categoryFilterChip,
                  isSelected && styles.categoryFilterChipActive,
                  isSelected && { borderColor: cat.color },
                ]}
                onPress={() => setSelectedCategoryId(cat.id as number | null)}
              >
                <View style={[styles.catDot, { backgroundColor: cat.color }]} />
                <Text
                  style={[
                    styles.categoryFilterText,
                    isSelected && styles.categoryFilterTextActive,
                  ]}
                >
                  {cat.name}
                </Text>
              </Pressable>
            );
          }}
        />
      </View>

      {/* Lista de Capturas (READ) */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Cargando capturas GeoCam...</Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              colors={[colors.primary]}
            />
          }
          renderItem={({ item }) => (
            <GeoCamCard
              item={item}
              onPress={(selected) => setDetailItem(selected)}
              onEdit={handleOpenEdit}
              onDelete={handleDeleteItem}
            />
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconCircle}>
                <Ionicons name="camera-outline" size={44} color={colors.textMuted} />
              </View>
              <Text style={styles.emptyTitle}>
                {searchQuery || selectedCategoryId !== null
                  ? 'Sin resultados para los filtros'
                  : 'Aún no hay capturas registradas'}
              </Text>
              <Text style={styles.emptySubtitle}>
                {searchQuery || selectedCategoryId !== null
                  ? 'Prueba limpiando el buscador o seleccionando otra categoría.'
                  : 'Toma fotografías con geolocalización GPS permanente usando la cámara o galería.'}
              </Text>

              <Pressable style={styles.emptyActionBtn} onPress={handleOpenCreate}>
                <Ionicons name="camera" size={18} color="#FFFFFF" />
                <Text style={styles.emptyActionBtnText}>Tomar Primera Foto</Text>
              </Pressable>
            </View>
          }
        />
      )}

      {/* Botón Flotante para Crear (+ Nueva GeoCam) */}
      <Pressable style={styles.fab} onPress={handleOpenCreate}>
        <Ionicons name="camera" size={24} color="#FFFFFF" />
        <Text style={styles.fabText}>Nueva Captura</Text>
      </Pressable>

      {/* Modales */}
      <GeoCamDetailModal
        visible={!!detailItem}
        item={detailItem}
        onClose={() => setDetailItem(null)}
        onEdit={handleOpenEdit}
        onDelete={handleDeleteItem}
      />

      <GeoCamFormModal
        visible={isFormVisible}
        editingItem={editingItem}
        categories={categories}
        onClose={() => setIsFormVisible(false)}
        onSave={handleSaveItem}
        onOpenCategoryManager={() => setIsCategoryModalVisible(true)}
      />

      <CategoryManagerModal
        visible={isCategoryModalVisible}
        categories={categories}
        onClose={() => setIsCategoryModalVisible(false)}
        onAddCategory={handleAddCategory}
        onDeleteCategory={handleDeleteCategory}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.surface,
    paddingTop: Platform.select({ ios: 54, default: 20 }),
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    ...shadow.sm,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.textPrimary,
  },
  migrationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primaryDark,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  migrationBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  headerSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
    maxWidth: 280,
  },
  categoriesBtn: {
    width: 38,
    height: 38,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.sm,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: colors.textPrimary,
    padding: 0,
  },
  categoryFiltersContainer: {
    gap: 6,
    paddingVertical: 4,
  },
  categoryFilterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryFilterChipActive: {
    backgroundColor: colors.primarySubtle,
    borderWidth: 1.5,
  },
  catDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  categoryFilterText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  categoryFilterTextActive: {
    color: colors.primaryDark,
    fontWeight: '800',
  },
  listContent: {
    padding: 16,
    paddingBottom: 90,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 18,
    marginBottom: 20,
  },
  emptyActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: radius.pill,
    ...shadow.glow,
  },
  emptyActionBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: radius.pill,
    ...shadow.glow,
  },
  fabText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 14,
  },
});

export default GeoCamScreen;
