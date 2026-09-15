import { KeyboardTypeOptions, StyleSheet, View } from 'react-native';
import { Text, TextInput } from 'react-native-paper';

type Props = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
};

export default function LabeledInput({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType,
  autoCapitalize,
}: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        mode="flat"
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        underlineColor="transparent"
        activeUnderlineColor="transparent"
        textColor="#2E6FB7"
        style={styles.input}
        contentStyle={styles.content}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#2E6FB7',
    marginBottom: 6,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#EEF3FA',
    borderRadius: 14,
    overflow: 'hidden',
  },
  content: {
    fontSize: 16,
  },
});
