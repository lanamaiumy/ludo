import { StyleSheet, View } from 'react-native';

export default function JourneyTrail() {
  return (
    <View style={styles.container}>
      <View style={styles.line} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  line: {
    height: '100%',
    borderLeftWidth: 5,
    borderColor: '#7FB2F0',
    borderStyle: 'dashed',
  },
});
