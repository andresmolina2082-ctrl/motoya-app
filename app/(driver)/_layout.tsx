import { Tabs } from 'expo-router';
import { View, Platform, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius } from '@/theme';
import MotoIA from '@/features/ai/MotoIA';

function TabIcon({
  nameFocused,
  nameOutline,
  focused,
}: {
  nameFocused: keyof typeof Ionicons.glyphMap;
  nameOutline: keyof typeof Ionicons.glyphMap;
  focused: boolean;
}) {
  return (
    <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
      <Ionicons
        name={focused ? nameFocused : nameOutline}
        size={22}
        color={focused ? colors.primaryDark : colors.textMuted}
      />
    </View>
  );
}

export default function DriverTabsLayout() {
  return (
    <View style={styles.root}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.primaryDark,
          tabBarInactiveTintColor: colors.textMuted,
          tabBarLabelStyle: styles.label,
          tabBarStyle: styles.tabBar,
        }}
      >
        {/* 1. Inicio del Conductor: conexión y solicitudes */}
        <Tabs.Screen
          name="home"
          options={{
            title: 'Inicio',
            tabBarIcon: ({ focused }) => (
              <TabIcon nameFocused="radio" nameOutline="radio-outline" focused={focused} />
            ),
          }}
        />

        {/* 2. Historial de Carreras del Conductor */}
        <Tabs.Screen
          name="trips"
          options={{
            title: 'Mis Carreras',
            tabBarIcon: ({ focused }) => (
              <TabIcon nameFocused="time" nameOutline="time-outline" focused={focused} />
            ),
          }}
        />

        {/* 3. GeoCam Persistente */}
        <Tabs.Screen
          name="geocam"
          options={{
            title: 'GeoCam',
            tabBarIcon: ({ focused }) => (
              <TabIcon nameFocused="camera" nameOutline="camera-outline" focused={focused} />
            ),
          }}
        />

        {/* 4. Perfil del Conductor */}
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Mi Perfil',
            tabBarIcon: ({ focused }) => (
              <TabIcon nameFocused="person" nameOutline="person-outline" focused={focused} />
            ),
          }}
        />
      </Tabs>

      {/* Botón flotante del asistente MOTO IA, visible en todas las pestañas */}
      <MotoIA />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  tabBar: {
    backgroundColor: colors.surface,
    borderTopColor: colors.border,
    borderTopWidth: 1,
    height: Platform.select({ ios: 88, default: 70 }),
    paddingTop: 8,
    paddingBottom: Platform.select({ ios: 28, default: 12 }),
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: '800',
    marginTop: 2,
    marginBottom: 2,
  },
  iconContainer: {
    width: 44,
    height: 28,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  iconContainerActive: {
    backgroundColor: colors.primarySubtle,
  },
});
