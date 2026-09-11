import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { colors } from '@/theme';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          headerStyle: { backgroundColor: colors.surface },
          headerShadowVisible: false,
          headerTintColor: colors.primaryDark,
          headerTitleStyle: { fontWeight: '900', fontSize: 17 },
        }}
      >
        {/* 1. Grupo Principal de Pestañas */}
        <Stack.Screen name="(tabs)" />

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
    </SafeAreaProvider>
  );
}
