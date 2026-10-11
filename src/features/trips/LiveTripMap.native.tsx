import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import { colors, radius } from '@/theme';

const TRIP_DURATION_MS = 45000;
const START_OFFSET_DEG = 0.01;

type Coords = { latitude: number; longitude: number };

function randomNearbyPoint(center: Coords): Coords {
  const angle = Math.random() * Math.PI * 2;
  return {
    latitude: center.latitude + Math.sin(angle) * START_OFFSET_DEG,
    longitude: center.longitude + Math.cos(angle) * START_OFFSET_DEG,
  };
}

export default function LiveTripMap() {
  const [pickup, setPickup] = useState<Coords | null>(null);
  const [motoStart, setMotoStart] = useState<Coords | null>(null);
  const [motoPosition, setMotoPosition] = useState<Coords | null>(null);
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      (async () => {
        try {
          const { status } = await Location.requestForegroundPermissionsAsync();
          if (status !== 'granted') {
            setErrorMsg('Activa el permiso de ubicación para ver el mapa en vivo');
            return;
          }
          const position = await Location.getCurrentPositionAsync({});
          const center = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          setPickup(center);
          setMotoStart(randomNearbyPoint(center));
        } catch {
          setErrorMsg('No se pudo obtener tu ubicación');
        }
      })();
    }, 0);
    return () => clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    if (!pickup || !motoStart) return;

    const startedAt = Date.now();
    const intervalId = setInterval(() => {
      const elapsed = Date.now() - startedAt;
      const t = Math.min(elapsed / TRIP_DURATION_MS, 1);
      setProgress(t);
      setMotoPosition({
        latitude: motoStart.latitude + (pickup.latitude - motoStart.latitude) * t,
        longitude: motoStart.longitude + (pickup.longitude - motoStart.longitude) * t,
      });
      if (t >= 1) clearInterval(intervalId);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [pickup, motoStart]);

  if (errorMsg) {
    return (
      <View style={[styles.mapContainer, styles.centerContent]}>
        <Ionicons name="alert-circle-outline" size={28} color={colors.textMuted} />
        <Text style={styles.fallbackText}>{errorMsg}</Text>
      </View>
    );
  }

  if (!pickup || !motoStart || !motoPosition) {
    return (
      <View style={[styles.mapContainer, styles.centerContent]}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  }

  const etaSeconds = Math.max(0, Math.round(((1 - progress) * TRIP_DURATION_MS) / 1000));

  return (
    <View style={styles.mapContainer}>
      <MapView
        style={StyleSheet.absoluteFill}
        initialRegion={{
          latitude: pickup.latitude,
          longitude: pickup.longitude,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        }}
      >
        <Marker coordinate={pickup} title="Tu punto de recogida" pinColor={colors.accent} />
        <Marker coordinate={motoPosition} title="Tu mototaxista">
          <View style={styles.motoMarker}>
            <Ionicons name="bicycle" size={16} color="#FFFFFF" />
          </View>
        </Marker>
        <Polyline
          coordinates={[motoPosition, pickup]}
          strokeColor={colors.primary}
          strokeWidth={3}
        />
      </MapView>
      <View style={styles.etaOverlay}>
        <Text style={styles.etaOverlayText}>
          {progress >= 1 ? 'Tu mototaxista llegó' : `Llega en ~${etaSeconds}s`}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mapContainer: {
    height: 220,
    borderRadius: radius.md,
    overflow: 'hidden',
    marginBottom: 16,
    backgroundColor: colors.surfaceAlt,
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
  },
  fallbackText: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  motoMarker: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  etaOverlay: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    right: 8,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    borderRadius: radius.sm,
    paddingVertical: 6,
    alignItems: 'center',
  },
  etaOverlayText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
});
