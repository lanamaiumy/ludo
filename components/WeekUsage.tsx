import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

type Props = {
  usage: boolean[];
};

const DAYS = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D'];

export default function WeekUsage({ usage }: Props) {
  return (
    <View style={styles.container}>
      {DAYS.map((day, index) => {
        const active = usage[index] ?? false;
        return (
          <View key={index} style={styles.dayColumn}>
            <View style={[styles.circle, active ? styles.circleActive : styles.circleInactive]} />
            <Text style={styles.label}>{day}</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayColumn: {
    alignItems: 'center',
    gap: 6,
  },
  circle: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  circleActive: {
    backgroundColor: '#2E6FB7',
  },
  circleInactive: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#B9CFE6',
  },
  label: {
    fontSize: 13,
    color: '#6E8BA8',
    fontWeight: '600',
  },
});
