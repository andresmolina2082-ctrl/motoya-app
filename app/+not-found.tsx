import { View, Text, StyleSheet } from 'react-native';
import { Link } from 'expo-router';
import { colors } from '@/theme';

export default function NotFoundScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>404</Text>
      <Text style={styles.subtitle}>Esta ruta no existe en MotoYa.</Text>
      <Link href="/" style={styles.link}>
        <Text style={styles.linkText}>Volver a pedir moto</Text>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF', padding: 24 },
  title: { fontSize: 48, fontWeight: '900', color: colors.secondary },
  subtitle: { fontSize: 16, color: colors.textSecondary, marginVertical: 12 },
  link: { marginTop: 12, paddingVertical: 8 },
  linkText: { color: colors.primaryDark, fontWeight: 'bold', fontSize: 14 },
});
