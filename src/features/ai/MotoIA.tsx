import { useCallback, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  Modal,
  ScrollView,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, radius, shadow } from '@/theme';
import { useAuth } from '@/features/auth/AuthContext';
import { sendChat, type ChatMessage } from './motoIaApi';

// Altura de la barra de pestañas (ver app/(tabs)/_layout.tsx) para que el botón quede encima
const TAB_BAR_HEIGHT = Platform.select({ ios: 88, default: 70 });

const SUGGESTIONS = {
  client: [
    '¿Cómo funciona MotoYa?',
    '¿Cuánto debería ofrecer por una carrera corta?',
    'Consejos de seguridad al viajar en moto',
  ],
  driver: [
    '¿Cómo consigo más carreras?',
    'Consejos para cuidar mi moto',
    '¿Qué hago si un pasajero no paga?',
  ],
};

export default function MotoIA() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Capa con el mismo ancho máximo que las pantallas, para que el botón no se pierda en web */}
      <View pointerEvents="box-none" style={styles.fabLayer}>
        <Pressable
          style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}
          onPress={() => setOpen(true)}
          accessibilityRole="button"
          accessibilityLabel="Abrir MOTO IA"
        >
          <MaterialCommunityIcons name="robot-happy" size={22} color="#FFFFFF" />
          <Text style={styles.fabText}>MOTO IA</Text>
        </Pressable>
      </View>

      <Modal
        visible={open}
        animationType="slide"
        presentationStyle={Platform.OS === 'ios' ? 'pageSheet' : 'fullScreen'}
        onRequestClose={() => setOpen(false)}
      >
        <MotoIAChat onClose={() => setOpen(false)} />
      </Modal>
    </>
  );
}

function MotoIAChat({ onClose }: { onClose: () => void }) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const scrollRef = useRef<ScrollView>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ask = useCallback(
    async (history: ChatMessage[]) => {
      setLoading(true);
      setError(null);
      try {
        const reply = await sendChat(history, user);
        setMessages([...history, { role: 'model', text: reply }]);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Ocurrió un error, intenta de nuevo');
      } finally {
        setLoading(false);
      }
    },
    [user],
  );

  const send = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    const history: ChatMessage[] = [...messages, { role: 'user', text: trimmed }];
    setMessages(history);
    setInput('');
    ask(history);
  };

  const firstName = user?.name?.split(' ')[0];
  const suggestions = SUGGESTIONS[user?.role ?? 'client'];

  return (
    <KeyboardAvoidingView
      style={styles.chatOuter}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.chatContainer}>
        {/* Encabezado */}
        <View
          style={[
            styles.header,
            { paddingTop: Platform.OS === 'ios' ? 16 : Math.max(insets.top, 16) },
          ]}
        >
          <View style={styles.headerBot}>
            <MaterialCommunityIcons name="robot-happy" size={24} color="#FFFFFF" />
          </View>
          <View style={styles.headerTextCol}>
            <Text style={styles.headerTitle}>MOTO IA</Text>
            <Text style={styles.headerSub}>Asistente inteligente de MotoYa</Text>
          </View>
          {messages.length > 0 && (
            <Pressable
              style={styles.headerButton}
              onPress={() => {
                setMessages([]);
                setError(null);
              }}
              disabled={loading}
              accessibilityLabel="Nueva conversación"
            >
              <Ionicons name="refresh" size={20} color="#FFFFFF" />
            </Pressable>
          )}
          <Pressable style={styles.headerButton} onPress={onClose} accessibilityLabel="Cerrar">
            <Ionicons name="close" size={22} color="#FFFFFF" />
          </Pressable>
        </View>

        {/* Conversación */}
        <ScrollView
          ref={scrollRef}
          style={styles.messages}
          contentContainerStyle={styles.messagesContent}
          keyboardShouldPersistTaps="handled"
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.length === 0 && (
            <View style={styles.welcome}>
              <View style={styles.welcomeBot}>
                <MaterialCommunityIcons name="robot-happy-outline" size={40} color={colors.primaryDark} />
              </View>
              <Text style={styles.welcomeTitle}>
                ¡Hola{firstName ? `, ${firstName}` : ''}! Soy MOTO IA
              </Text>
              <Text style={styles.welcomeText}>
                Pregúntame lo que quieras: sobre la app, rutas en Riohacha, seguridad, o
                cualquier otra cosa.
              </Text>
              <View style={styles.suggestions}>
                {suggestions.map((s) => (
                  <Pressable key={s} style={styles.suggestionChip} onPress={() => send(s)}>
                    <Text style={styles.suggestionText}>{s}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}

          {messages.map((m, i) =>
            m.role === 'user' ? (
              <View key={i} style={[styles.bubble, styles.userBubble]}>
                <Text style={styles.userText}>{m.text}</Text>
              </View>
            ) : (
              <View key={i} style={styles.botRow}>
                <View style={styles.botAvatar}>
                  <MaterialCommunityIcons name="robot-happy" size={14} color="#FFFFFF" />
                </View>
                <View style={[styles.bubble, styles.botBubble]}>
                  <Text style={styles.botText} selectable>
                    {m.text}
                  </Text>
                </View>
              </View>
            ),
          )}

          {loading && (
            <View style={styles.botRow}>
              <View style={styles.botAvatar}>
                <MaterialCommunityIcons name="robot-happy" size={14} color="#FFFFFF" />
              </View>
              <View style={[styles.bubble, styles.botBubble, styles.typingBubble]}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={styles.typingText}>MOTO IA está pensando...</Text>
              </View>
            </View>
          )}

          {error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
              <Pressable style={styles.retryButton} onPress={() => ask(messages)}>
                <Ionicons name="refresh" size={14} color={colors.danger} />
                <Text style={styles.retryText}>Reintentar</Text>
              </Pressable>
            </View>
          )}
        </ScrollView>

        {/* Caja de texto */}
        <View style={[styles.inputBar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Escribe tu pregunta..."
            placeholderTextColor={colors.textMuted}
            multiline
            maxLength={4000}
            submitBehavior={Platform.OS === 'web' ? 'submit' : undefined}
            onSubmitEditing={Platform.OS === 'web' ? () => send(input) : undefined}
          />
          <Pressable
            style={[styles.sendButton, (!input.trim() || loading) && styles.sendButtonDisabled]}
            onPress={() => send(input)}
            disabled={!input.trim() || loading}
            accessibilityLabel="Enviar"
          >
            <Ionicons name="send" size={18} color="#FFFFFF" />
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  fabLayer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: TAB_BAR_HEIGHT + 16,
    maxWidth: 500,
    width: '100%',
    alignSelf: 'center',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
  },
  fab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: radius.pill,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    ...shadow.glow,
  },
  fabPressed: {
    backgroundColor: colors.primaryDark,
    transform: [{ scale: 0.97 }],
  },
  fabText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.5,
  },

  chatOuter: {
    flex: 1,
    backgroundColor: colors.secondary,
  },
  chatContainer: {
    flex: 1,
    backgroundColor: colors.background,
    maxWidth: 500,
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.secondary,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  headerBot: {
    width: 42,
    height: 42,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTextCol: {
    flex: 1,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  headerSub: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    marginTop: 1,
  },
  headerButton: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  messages: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    gap: 10,
  },
  welcome: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 8,
  },
  welcomeBot: {
    width: 76,
    height: 76,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  welcomeTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.textPrimary,
  },
  welcomeText: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 19,
    paddingHorizontal: 12,
  },
  suggestions: {
    width: '100%',
    gap: 8,
    marginTop: 12,
  },
  suggestionChip: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: 12,
    paddingHorizontal: 14,
    ...shadow.sm,
  },
  suggestionText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primaryDark,
  },

  bubble: {
    maxWidth: '85%',
    borderRadius: radius.md,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: colors.primary,
    borderBottomRightRadius: radius.xs,
  },
  userText: {
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 20,
  },
  botRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  botAvatar: {
    width: 26,
    height: 26,
    borderRadius: radius.pill,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  botBubble: {
    flexShrink: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderBottomLeftRadius: radius.xs,
  },
  botText: {
    color: colors.textPrimary,
    fontSize: 14,
    lineHeight: 20,
  },
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  typingText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  errorBox: {
    backgroundColor: colors.dangerSoft,
    borderRadius: radius.md,
    padding: 12,
    gap: 8,
  },
  errorText: {
    color: colors.danger,
    fontSize: 13,
    fontWeight: '600',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
  },
  retryText: {
    color: colors.danger,
    fontSize: 13,
    fontWeight: '800',
  },

  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    paddingHorizontal: 12,
    paddingTop: 10,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.lg,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    fontSize: 14,
    color: colors.textPrimary,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: colors.textMuted,
  },
});
