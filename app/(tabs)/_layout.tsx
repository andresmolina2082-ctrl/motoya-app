import { Tabs } from 'expo-router';
import { View, Platform, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius } from '@/theme';

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
    <View
      style={[
        styles.iconContainer,
        focused && styles.iconContainerActive,
      ]}
    >
      <Ionicons
        name={focused ? nameFocused : nameOutline}
        size={22}
        color={focused ? colors.primaryDark : colors.textMuted}
      />
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primaryDark,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: styles.label,
        tabBarStyle: styles.tabBar,
      }}
    >
      {/* 1. Pedir Moto (Home) */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Pedir Moto',
          tabBarIcon: ({ focused }) => (
            <TabIcon
              nameFocused="bicycle"
              nameOutline="bicycle-outline"
              focused={focused}
            />
          ),
        }}
      />

      {/* 2. Historial de Carreras */}
      <Tabs.Screen
        name="trips"
        options={{
          title: 'Mis Viajes',
          tabBarIcon: ({ focused }) => (
            <TabIcon
              nameFocused="time"
              nameOutline="time-outline"
              focused={focused}
            />
          ),
        }}
      />

      {/* 3. Perfil & Billetera */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Mi Perfil',
          tabBarIcon: ({ focused }) => (
            <TabIcon
              nameFocused="person"
              nameOutline="person-outline"
              focused={focused}
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
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
