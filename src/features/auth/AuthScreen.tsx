import { useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Card from '@/components/Card';
import { colors, radius, shadow } from '@/theme';
import { useAuth, type UserRole } from '@/features/auth/AuthContext';

type Mode = 'login' | 'register';

export default function AuthScreen() {
  const insets = useSafeAreaInsets();
  const { login, register } = useAuth();

  const [mode, setMode] = useState<Mode>('login');
  const [role, setRole] = useState<UserRole>('client');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [motoModel, setMotoModel] = useState('');
  const [plate, setPlate] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Referencias a los inputs para mover el foco al siguiente campo desde el teclado
  const phoneRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const motoModelRef = useRef<TextInput>(null);
  const plateRef = useRef<TextInput>(null);

  const isRegister = mode === 'register';
  const hasPassword = role === 'driver';
  const hasVehicle = isRegister && role === 'driver';

  const handleSubmit = async () => {
    setError(null);
    setSubmitting(true);
    try {
      if (isRegister) {
        await register({
          name,
          phone,
          password: role === 'driver' ? password : undefined,
          role,
          motoModel,
          plate,
        });
      } else {
        await login(phone, role === 'driver' ? password : undefined, role);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ocurrió un error, intenta de nuevo');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.outerContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.container}>
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: Math.max(insets.top, Platform.OS === 'web' ? 24 : 32) },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.brandRow}>
            <View style={styles.brandBadge}>
              <Ionicons name="flash" size={18} color="#FFFFFF" />
            </View>
            <View>
              <Text style={styles.brandTitle}>MotoYa 🏍️</Text>
              <Text style={styles.brandSub}>Riohacha · La Guajira</Text>
            </View>
          </View>

          <Text style={styles.heroTitle}>
            {isRegister ? 'Crea tu cuenta' : '¡Bienvenido de nuevo!'}
          </Text>
          <Text style={styles.heroSubtitle}>
            {isRegister
              ? 'Regístrate como pasajero o como mototaxista'
              : 'Inicia sesión para pedir o aceptar carreras'}
          </Text>

          <View style={styles.roleRow}>
            <Pressable
              style={[styles.roleChip, role === 'client' && styles.roleChipActive]}
              onPress={() => setRole('client')}
            >
              <Ionicons
                name="person"
                size={18}
                color={role === 'client' ? '#FFFFFF' : colors.primaryDark}
              />
              <Text style={[styles.roleText, role === 'client' && styles.roleTextActive]}>
                Soy Pasajero
              </Text>
            </Pressable>
            <Pressable
              style={[styles.roleChip, role === 'driver' && styles.roleChipActive]}
              onPress={() => setRole('driver')}
            >
              <Ionicons
                name="bicycle"
                size={18}
                color={role === 'driver' ? '#FFFFFF' : colors.primaryDark}
              />
              <Text style={[styles.roleText, role === 'driver' && styles.roleTextActive]}>
                Soy Mototaxista
              </Text>
            </Pressable>
          </View>

          <Card style={styles.formCard}>
            {isRegister && (
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>NOMBRE COMPLETO</Text>
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="Ej. Andrés Molina"
                  placeholderTextColor={colors.textMuted}
                  autoCapitalize="words"
                  returnKeyType="next"
                  submitBehavior="submit"
                  onSubmitEditing={() => phoneRef.current?.focus()}
                />
              </View>
            )}

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>TELÉFONO</Text>
              <TextInput
                ref={phoneRef}
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                placeholder="Ej. 3001234567"
                placeholderTextColor={colors.textMuted}
                keyboardType="phone-pad"
                returnKeyType={hasPassword ? 'next' : 'done'}
                submitBehavior={hasPassword ? 'submit' : 'blurAndSubmit'}
                onSubmitEditing={() =>
                  hasPassword ? passwordRef.current?.focus() : handleSubmit()
                }
              />
            </View>

            {role === 'driver' && (
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>CONTRASEÑA</Text>
                <TextInput
                  ref={passwordRef}
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="••••••••"
                  placeholderTextColor={colors.textMuted}
                  secureTextEntry
                  returnKeyType={hasVehicle ? 'next' : 'done'}
                  submitBehavior={hasVehicle ? 'submit' : 'blurAndSubmit'}
                  onSubmitEditing={() =>
                    hasVehicle ? motoModelRef.current?.focus() : handleSubmit()
                  }
                />
              </View>
            )}

            {isRegister && role === 'driver' && (
              <>
                <View style={styles.field}>
                  <Text style={styles.fieldLabel}>MODELO DE MOTO</Text>
                  <TextInput
                    ref={motoModelRef}
                    style={styles.input}
                    value={motoModel}
                    onChangeText={setMotoModel}
                    placeholder="Ej. Bajaj Boxer CT 100"
                    placeholderTextColor={colors.textMuted}
                    returnKeyType="next"
                    submitBehavior="submit"
                    onSubmitEditing={() => plateRef.current?.focus()}
                  />
                </View>
                <View style={styles.field}>
                  <Text style={styles.fieldLabel}>PLACA</Text>
                  <TextInput
                    style={styles.input}
                    value={plate}
                    onChangeText={setPlate}
                    ref={plateRef}
                    placeholder="Ej. QWE-45F"
                    placeholderTextColor={colors.textMuted}
                    autoCapitalize="characters"
                    returnKeyType="done"
                    onSubmitEditing={handleSubmit}
                  />
                </View>
              </>
            )}

            {error && <Text style={styles.errorText}>{error}</Text>}

            <Pressable
              style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={submitting}
            >
              <Text style={styles.submitButtonText}>
                {submitting ? 'Procesando...' : isRegister ? 'Crear cuenta' : 'Iniciar sesión'}
              </Text>
            </Pressable>
          </Card>

          <Pressable
            style={styles.switchModeButton}
            onPress={() => {
              setError(null);
              setMode(isRegister ? 'login' : 'register');
            }}
          >
            <Text style={styles.switchModeText}>
              {isRegister ? '¿Ya tienes cuenta? ' : '¿Nuevo en MotoYa? '}
              <Text style={styles.switchModeTextBold}>
                {isRegister ? 'Inicia sesión' : 'Crea tu cuenta'}
              </Text>
            </Text>
          </Pressable>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  container: {
    flex: 1,
    backgroundColor: colors.secondary,
    maxWidth: 500,
    width: '100%',
    alignSelf: 'center',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 24,
  },
  brandBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  brandSub: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.75)',
    marginTop: 6,
    marginBottom: 20,
    lineHeight: 18,
  },
  roleRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  roleChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: radius.md,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  roleChipActive: {
    backgroundColor: colors.primaryDark,
    borderColor: colors.primaryDark,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  roleTextActive: {
    color: '#FFFFFF',
  },
  formCard: {
    padding: 18,
    ...shadow.glow,
  },
  field: {
    marginBottom: 14,
  },
  fieldLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: colors.textMuted,
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    backgroundColor: colors.surfaceAlt,
  },
  errorText: {
    color: colors.danger,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 12,
  },
  submitButton: {
    backgroundColor: colors.primary,
    paddingVertical: 15,
    borderRadius: radius.md,
    alignItems: 'center',
    marginTop: 4,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
  },
  switchModeButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  switchModeText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.75)',
  },
  switchModeTextBold: {
    color: colors.primary,
    fontWeight: '900',
  },
});
