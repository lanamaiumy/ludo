import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';
import { Text, TouchableRipple } from 'react-native-paper';

type Props = {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  disabled?: boolean;
};

const ROWS = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
];

export default function PinPad({ value, onChange, length = 4, disabled = false }: Props) {
  function pressDigit(digit: string) {
    if (disabled || value.length >= length) {
      return;
    }
    onChange(value + digit);
  }

  function erase() {
    if (disabled || value.length === 0) {
      return;
    }
    onChange(value.slice(0, -1));
  }

  function renderDigit(digit: string) {
    return (
      <TouchableRipple
        key={digit}
        borderless
        style={styles.key}
        onPress={() => pressDigit(digit)}
        accessibilityRole="button"
        accessibilityLabel={`Número ${digit}`}
      >
        <Text style={styles.keyText}>{digit}</Text>
      </TouchableRipple>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.dots}>
        {Array.from({ length }, (_, index) => (
          <View
            key={index}
            testID={index < value.length ? 'pin-dot-filled' : 'pin-dot-empty'}
            style={[styles.dot, index < value.length && styles.dotFilled]}
          />
        ))}
      </View>

      {ROWS.map((row) => (
        <View key={row.join('')} style={styles.row}>
          {row.map(renderDigit)}
        </View>
      ))}

      <View style={styles.row}>
        <View style={styles.keySpacer} />
        {renderDigit('0')}
        <TouchableRipple
          borderless
          style={styles.keySpacer}
          onPress={erase}
          accessibilityRole="button"
          accessibilityLabel="Apagar"
        >
          <View style={styles.eraseInner}>
            <MaterialCommunityIcons name="backspace-outline" size={28} color="#5B7896" />
          </View>
        </TouchableRipple>
      </View>
    </View>
  );
}

const KEY_SIZE = 76;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  dots: {
    flexDirection: 'row',
    gap: 22,
    marginBottom: 36,
  },
  dot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#22466B',
    backgroundColor: '#FFFFFF',
  },
  dotFilled: {
    backgroundColor: '#22466B',
  },
  row: {
    flexDirection: 'row',
    gap: 28,
    marginBottom: 18,
  },
  key: {
    width: KEY_SIZE,
    height: KEY_SIZE,
    borderRadius: KEY_SIZE / 2,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#22466B',
    backgroundColor: '#B9D6F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyText: {
    fontSize: 26,
    fontWeight: '700',
    color: '#22466B',
  },
  keySpacer: {
    width: KEY_SIZE,
    height: KEY_SIZE,
    borderRadius: KEY_SIZE / 2,
  },
  eraseInner: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
