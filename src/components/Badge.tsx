import { View, Text, StyleSheet } from 'react-native';
import { radius } from '@/theme';

type Props = {
  text: string;
  color?: string;
  bg?: string;
  size?: 'sm' | 'md';
};

export default function Badge({ text, color = '#00C853', bg, size = 'sm' }: Props) {
  const backgroundColor = bg ?? `${color}18`;

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor },
        size === 'md' ? styles.badgeMd : styles.badgeSm,
      ]}
    >
      <Text
        style={[
          styles.text,
          { color },
          size === 'md' ? styles.textMd : styles.textSm,
        ]}
      >
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: radius.pill,
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeSm: {
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeMd: {
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  text: {
    fontWeight: '800',
  },
  textSm: {
    fontSize: 10,
  },
  textMd: {
    fontSize: 12,
  },
});
