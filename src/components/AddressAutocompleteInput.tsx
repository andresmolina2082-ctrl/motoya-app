import { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  type StyleProp,
  type TextStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, shadow } from '@/theme';
import { useAddressAutocomplete } from '@/features/ride/useAddressAutocomplete';

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  onSelectAddress: (text: string) => void;
  placeholder?: string;
  placeholderTextColor?: string;
  style?: StyleProp<TextStyle>;
};

export default function AddressAutocompleteInput({
  value,
  onChangeText,
  onSelectAddress,
  placeholder,
  placeholderTextColor,
  style,
}: Props) {
  const [focused, setFocused] = useState(false);
  const { suggestions, loading } = useAddressAutocomplete(value, focused);

  const showDropdown = focused && (loading || suggestions.length > 0);

  return (
    <View style={styles.wrapper}>
      <TextInput
        style={style}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={placeholderTextColor}
        onFocus={() => setFocused(true)}
        onBlur={() => setTimeout(() => setFocused(false), 150)}
      />

      {showDropdown && (
        <View style={styles.dropdown}>
          {loading && suggestions.length === 0 && (
            <View style={styles.dropdownRow}>
              <ActivityIndicator size="small" color={colors.primaryDark} />
            </View>
          )}
          {suggestions.map((suggestion) => (
            <Pressable
              key={suggestion.placeId}
              style={styles.dropdownRow}
              onPress={() => {
                onSelectAddress(suggestion.text);
                setFocused(false);
              }}
            >
              <Ionicons name="location-outline" size={14} color={colors.textMuted} />
              <Text style={styles.dropdownText} numberOfLines={1}>
                {suggestion.text}
              </Text>
            </Pressable>
          ))}
          {suggestions.length > 0 && (
            <Text style={styles.attributionText}>© OpenStreetMap contributors</Text>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    marginTop: 6,
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    zIndex: 20,
    ...shadow.card,
  },
  dropdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  dropdownText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  attributionText: {
    fontSize: 9,
    color: colors.textMuted,
    textAlign: 'center',
    paddingVertical: 6,
  },
});
