import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SQLiteProvider } from 'expo-sqlite';
import { colors } from '@/theme';
import { DATABASE_NAME, migrateDbIfNeeded } from '@/db/database';
import { AuthProvider, useAuth } from '@/features/auth/AuthContext';

function RootLayoutNav() {
  const { user, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    const inAuthGroup = segments[0] === '(auth)';
    const inClientGroup = segments[0] === '(tabs)';
    const inDriverGroup = segments[0] === '(driver)';

    if (!user) {
      if (!inAuthGroup) router.replace('/login');
      return;
    }

    const homeRoute = user.role === 'driver' ? '/home' : '/(tabs)';

    if (inAuthGroup) {
      router.replace(homeRoute);
    } else if (user.role === 'driver' && inClientGroup) {
      router.replace(homeRoute);
    } else if (user.role === 'client' && inDriverGroup) {
      router.replace(homeRoute);
    }
  }, [user, isLoading, segments, router]);

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors.secondary,
        }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        headerStyle: { backgroundColor: colors.surface },
        headerShadowVisible: false,
        headerTintColor: colors.primaryDark,
        headerTitleStyle: { fontWeight: '900', fontSize: 17 },
      }}
    >
      {/* 0. Grupo de Autenticación: Login / Registro */}
      <Stack.Screen name="(auth)" />

      {/* 1. Grupo de Pestañas del Pasajero */}
      <Stack.Screen name="(tabs)" />

      {/* 1b. Grupo de Pestañas del Mototaxista */}
      <Stack.Screen name="(driver)" />

      {/* 2. Modal Nativo: Radar de Ofertas en Vivo (inDriver style) */}
      <Stack.Screen
        name="modal"
        options={{
          presentation: 'modal',
          headerShown: true,
          title: 'Ofertas de Mototaxis en Vivo',
        }}
      />

      {/* 3. Ruta Dinámica [id]: Expediente del Mototaxista */}
      <Stack.Screen
        name="driver/[id]"
        options={{
          headerShown: true,
          title: 'Perfil del Mototaxista',
        }}
      />

      {/* 4. Ruta Dinámica [id]: Monitoreo de Carrera Activa */}
      <Stack.Screen
        name="trip/[id]"
        options={{
          headerShown: true,
          title: 'Carrera en Curso',
        }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <SQLiteProvider databaseName={DATABASE_NAME} onInit={migrateDbIfNeeded}>
        <AuthProvider>
          <RootLayoutNav />
        </AuthProvider>
      </SQLiteProvider>
    </SafeAreaProvider>
  );
}
