import React, { useEffect, useState, useCallback } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { GeoCam, GeoCamCategory } from '../types';
import { savePermanentPhoto } from '../storage';
import { colors, radius, shadow } from '@/theme';

interface GeoCamFormModalProps {
  visible: boolean;
  editingItem: GeoCam | null;
  categories: GeoCamCategory[];
  onClose: () => void;
  onSave: (data: {
    title: string;
    description?: string;
    photo_uri: string;
    latitude: number;
    longitude: number;
    address?: string;
    category_id: number;
  }) => Promise<void>;
  onOpenCategoryManager: () => void;
}

interface FormInnerProps {
  editingItem: GeoCam | null;
  categories: GeoCamCategory[];
  onClose: () => void;
  onSave: GeoCamFormModalProps['onSave'];
  onOpenCategoryManager: () => void;
}

function FormInner({
  editingItem,
  categories,
  onClose,
  onSave,
  onOpenCategoryManager,
}: FormInnerProps) {
  const [title, setTitle] = useState(editingItem?.title ?? '');
  const [description, setDescription] = useState(editingItem?.description ?? '');
  const [photoUri, setPhotoUri] = useState<string | null>(editingItem?.photo_uri ?? null);
  const [latitude, setLatitude] = useState<number | null>(editingItem?.latitude ?? null);
  const [longitude, setLongitude] = useState<number | null>(editingItem?.longitude ?? null);
  const [address, setAddress] = useState<string>(editingItem?.address ?? '');
  const [categoryId, setCategoryId] = useState<number>(
    editingItem?.category_id ?? (categories.length > 0 ? categories[0].id : 1),
  );

  const [isLoadingGps, setIsLoadingGps] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Obtener geolocalización actual
  const fetchCurrentLocation = useCallback(async () => {
    try {
      setIsLoadingGps(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permiso de Ubicación',
          'Se requiere acceso a la ubicación para registrar las coordenadas GPS de la GeoCam.',
        );
        setLatitude(11.5444);
        setLongitude(-72.9072);
        setAddress('Riohacha, La Guajira (Ubicación predeterminada)');
        setIsLoadingGps(false);
        return;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      setLatitude(lat);
      setLongitude(lon);

      try {
        const [geo] = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lon });
        if (geo) {
          const formatted = [geo.street, geo.district, geo.city, geo.region]
            .filter(Boolean)
            .join(', ');
          setAddress(formatted || 'Coordenadas registradas');
        }
      } catch {
        setAddress('Ubicación capturada vía GPS');
      }
    } catch (error) {
      console.warn('Error al obtener ubicación:', error);
      if (latitude === null) {
        setLatitude(11.5444);
        setLongitude(-72.9072);
        setAddress('Riohacha, La Guajira');
      }
    } finally {
      setIsLoadingGps(false);
    }
  }, [latitude]);

  useEffect(() => {
    if (editingItem) return;

    let isMounted = true;
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          if (isMounted) {
            setLatitude(11.5444);
            setLongitude(-72.9072);
            setAddress('Riohacha, La Guajira (Ubicación predeterminada)');
          }
          return;
        }

        const position = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        if (!isMounted) return;
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        setLatitude(lat);
        setLongitude(lon);

        try {
          const [geo] = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lon });
          if (geo && isMounted) {
            const formatted = [geo.street, geo.district, geo.city, geo.region]
              .filter(Boolean)
              .join(', ');
            setAddress(formatted || 'Coordenadas registradas');
          }
        } catch {
          if (isMounted) setAddress('Ubicación capturada vía GPS');
        }
      } catch {
        if (isMounted) {
          setLatitude(11.5444);
          setLongitude(-72.9072);
          setAddress('Riohacha, La Guajira');
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [editingItem]);

  // Tomar foto con la cámara nativa
  const handleTakePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso requerido', 'Se requiere acceso a la cámara para tomar fotografías.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 0.8,
        aspect: [4, 3],
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setPhotoUri(result.assets[0].uri);
        fetchCurrentLocation();
      }
    } catch (error) {
      console.warn('Error al abrir la cámara:', error);
      Alert.alert('Error de Cámara', 'No se pudo abrir la cámara.');
    }
  };

  // Seleccionar foto desde la galería
  const handlePickFromGallery = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso requerido', 'Se requiere acceso a las fotos.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        quality: 0.8,
        aspect: [4, 3],
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setPhotoUri(result.assets[0].uri);
        if (latitude === null) {
          fetchCurrentLocation();
        }
      }
    } catch (error) {
      console.warn('Error al abrir la galería:', error);
    }
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert('Campo Obligatorio', 'Por favor ingresa un título para la fotografía.');
      return;
    }

    if (!photoUri) {
      Alert.alert('Foto requerida', 'Debes tomar una foto con la cámara o elegir una de la galería.');
      return;
    }

    const lat = latitude ?? 11.5444;
    const lon = longitude ?? -72.9072;

    try {
      setIsSubmitting(true);

      let finalUri = photoUri;
      if (!editingItem) {
        finalUri = await savePermanentPhoto(photoUri);
      }

      await onSave({
        title: title.trim(),
        description: description.trim() || undefined,
        photo_uri: finalUri,
        latitude: lat,
        longitude: lon,
        address: address.trim() || undefined,
        category_id: categoryId,
      });

      onClose();
    } catch (error) {
      console.error('Error al guardar GeoCam:', error);
      Alert.alert('Error', 'No se pudo guardar el registro en la base de datos.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.closeBtn} onPress={onClose} disabled={isSubmitting}>
          <Ionicons name="close" size={24} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>
          {editingItem ? 'Editar GeoCam' : 'Nueva Captura GeoCam'}
        </Text>
        <Pressable
          style={[styles.saveHeaderBtn, isSubmitting && styles.btnDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.saveHeaderText}>Guardar</Text>
          )}
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Sección de Fotografía */}
        <View style={styles.photoSection}>
          {photoUri ? (
            <View style={styles.previewContainer}>
              <Image source={{ uri: photoUri }} style={styles.previewImage} contentFit="cover" />
              {!editingItem && (
                <View style={styles.retakeRow}>
                  <Pressable style={styles.retakeBtn} onPress={handleTakePhoto}>
                    <Ionicons name="camera" size={16} color="#FFFFFF" />
                    <Text style={styles.retakeBtnText}>Repetir Foto</Text>
                  </Pressable>
                  <Pressable style={styles.retakeBtn} onPress={handlePickFromGallery}>
                    <Ionicons name="images" size={16} color="#FFFFFF" />
                    <Text style={styles.retakeBtnText}>Cambiar</Text>
                  </Pressable>
                </View>
              )}
            </View>
          ) : (
            <View style={styles.photoPromptContainer}>
              <Ionicons name="camera-outline" size={54} color={colors.textMuted} />
              <Text style={styles.promptTitle}>Captura o sube una fotografía</Text>
              <Text style={styles.promptSub}>
                La imagen se guardará de forma permanente en el almacenamiento del dispositivo.
              </Text>

              <View style={styles.photoBtnGroup}>
                <Pressable style={styles.cameraBtn} onPress={handleTakePhoto}>
                  <Ionicons name="camera" size={20} color="#FFFFFF" />
                  <Text style={styles.cameraBtnText}>Tomar con Cámara</Text>
                </Pressable>

                <Pressable style={styles.galleryBtn} onPress={handlePickFromGallery}>
                  <Ionicons name="images-outline" size={20} color={colors.textPrimary} />
                  <Text style={styles.galleryBtnText}>Galería</Text>
                </Pressable>
              </View>
            </View>
          )}
        </View>

        {/* Sección de Geolocalización GPS */}
        <View style={styles.card}>
          <View style={styles.gpsHeader}>
            <View style={styles.gpsTitleRow}>
              <Ionicons name="location" size={18} color={colors.primary} />
              <Text style={styles.cardSectionTitle}>Ubicación GPS</Text>
            </View>

            {!editingItem && (
              <Pressable
                style={styles.refreshGpsBtn}
                onPress={fetchCurrentLocation}
                disabled={isLoadingGps}
              >
                {isLoadingGps ? (
                  <ActivityIndicator size="small" color={colors.primaryDark} />
                ) : (
                  <>
                    <Ionicons name="refresh" size={14} color={colors.primaryDark} />
                    <Text style={styles.refreshGpsText}>Actualizar GPS</Text>
                  </>
                )}
              </Pressable>
            )}
          </View>

          {latitude !== null && longitude !== null ? (
            <View style={styles.gpsDataBox}>
              <Text style={styles.gpsCoordsText}>
                📍 {latitude.toFixed(6)}, {longitude.toFixed(6)}
              </Text>
              {address ? <Text style={styles.gpsAddressText}>{address}</Text> : null}
            </View>
          ) : (
            <Text style={styles.gpsWaitingText}>Obteniendo coordenadas GPS actuales...</Text>
          )}
        </View>

        {/* Campos del formulario */}
        <View style={styles.card}>
          {/* Título */}
          <Text style={styles.inputLabel}>Título de la Captura *</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Ej: Inspección frenos y casco / Paradero Calle 15"
            placeholderTextColor={colors.textMuted}
            value={title}
            onChangeText={setTitle}
          />

          {/* Categoría relacionada */}
          <View style={styles.categoryHeaderRow}>
            <Text style={styles.inputLabel}>Categoría (Relación 1:N)</Text>
            <Pressable onPress={onOpenCategoryManager} hitSlop={6}>
              <Text style={styles.manageCategoryLink}>+ Gestionar Categorías</Text>
            </Pressable>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
            {categories.map((cat) => {
              const isSelected = categoryId === cat.id;
              const catIcon = (cat.icon as keyof typeof Ionicons.glyphMap) || 'folder';
              return (
                <Pressable
                  key={cat.id}
                  style={[
                    styles.categoryChip,
                    isSelected && {
                      backgroundColor: cat.color,
                      borderColor: cat.color,
                    },
                  ]}
                  onPress={() => setCategoryId(cat.id)}
                >
                  <Ionicons
                    name={catIcon}
                    size={14}
                    color={isSelected ? '#FFFFFF' : colors.textSecondary}
                  />
                  <Text
                    style={[styles.categoryChipText, isSelected && styles.categoryChipTextSelected]}
                  >
                    {cat.name}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {/* Descripción */}
          <Text style={[styles.inputLabel, { marginTop: 14 }]}>Descripción / Observaciones</Text>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            placeholder="Detalles sobre el punto, estado del vehículo o reporte..."
            placeholderTextColor={colors.textMuted}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        {/* Botón Guardar principal */}
        <Pressable
          style={[styles.mainSubmitBtn, isSubmitting && styles.btnDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="checkmark-circle-outline" size={20} color="#FFFFFF" />
              <Text style={styles.mainSubmitBtnText}>
                {editingItem ? 'Actualizar Captura' : 'Guardar en Base de Datos'}
              </Text>
            </>
          )}
        </Pressable>
      </ScrollView>
    </View>
  );
}

export function GeoCamFormModal(props: GeoCamFormModalProps) {
  if (!props.visible) return null;

  return (
    <Modal
      visible={props.visible}
      animationType="slide"
      transparent={false}
      onRequestClose={props.onClose}
    >
      <FormInner
        key={props.editingItem ? `edit-${props.editingItem.id}` : 'new'}
        editingItem={props.editingItem}
        categories={props.categories}
        onClose={props.onClose}
        onSave={props.onSave}
        onOpenCategoryManager={props.onOpenCategoryManager}
      />
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
  saveHeaderBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: radius.pill,
  },
  saveHeaderText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  photoSection: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 14,
  },
  previewContainer: {
    position: 'relative',
    height: 240,
    backgroundColor: '#000',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  retakeRow: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    flexDirection: 'row',
    gap: 8,
  },
  retakeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radius.pill,
  },
  retakeBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  photoPromptContainer: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  promptTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
    marginTop: 10,
  },
  promptSub: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 16,
    maxWidth: 280,
  },
  photoBtnGroup: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  cameraBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: radius.sm,
  },
  cameraBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
  galleryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 12,
    borderRadius: radius.sm,
  },
  galleryBtnText: {
    color: colors.textPrimary,
    fontWeight: '800',
    fontSize: 13,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 14,
    ...shadow.sm,
  },
  gpsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  gpsTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cardSectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  refreshGpsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: colors.primarySubtle,
    borderRadius: radius.xs,
  },
  refreshGpsText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  gpsDataBox: {
    backgroundColor: colors.primarySubtle,
    padding: 10,
    borderRadius: radius.xs,
  },
  gpsCoordsText: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.primaryDark,
  },
  gpsAddressText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  gpsWaitingText: {
    fontSize: 12,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.textPrimary,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  categoryHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
    marginBottom: 6,
  },
  manageCategoryLink: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.info,
  },
  chipsScroll: {
    flexDirection: 'row',
    marginHorizontal: -4,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    marginHorizontal: 4,
  },
  categoryChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  categoryChipTextSelected: {
    color: '#FFFFFF',
  },
  mainSubmitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: radius.sm,
    marginTop: 10,
    ...shadow.glow,
  },
  mainSubmitBtnText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 15,
  },
});
