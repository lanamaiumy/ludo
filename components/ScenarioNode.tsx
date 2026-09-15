import { ComponentProps } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';
import { Text, TouchableRipple } from 'react-native-paper';
import { Scenario } from '../src/types/Scenario';

type IconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

type Props = {
  scenario: Scenario;
  onPress: () => void;
};

const ICONS: Record<string, IconName> = {
  quarto: 'bed',
  sala: 'sofa',
  parque: 'pine-tree',
  escola: 'school',
  rua: 'car',
};

export default function ScenarioNode({ scenario, onPress }: Props) {
  const locked = scenario.status === 'locked';
  const completed = scenario.status === 'completed';
  const current = scenario.status === 'unlocked';
  const iconName = ICONS[scenario.id] ?? 'star';

  const nodeStyle = current
    ? styles.nodeCurrent
    : completed
      ? styles.nodeCompleted
      : styles.nodeLocked;
  const iconColor = locked ? '#9FB1C6' : '#FFFFFF';

  return (
    <View style={styles.container}>
      <TouchableRipple borderless disabled={locked} onPress={onPress} style={[styles.node, nodeStyle]}>
        <MaterialCommunityIcons name={iconName} size={40} color={iconColor} />
      </TouchableRipple>

      {completed && (
        <View testID="badge-completed" style={[styles.badge, styles.badgeCompleted]}>
          <MaterialCommunityIcons name="check" size={16} color="#FFFFFF" />
        </View>
      )}
      {locked && (
        <View testID="badge-locked" style={[styles.badge, styles.badgeLocked]}>
          <MaterialCommunityIcons name="lock" size={14} color="#FFFFFF" />
        </View>
      )}

      <Text style={[styles.name, locked && styles.nameLocked]}>{scenario.name}</Text>
      {current && (
        <View style={styles.currentPill}>
          <Text style={styles.currentLabel}>Atual</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  node: {
    width: 92,
    height: 92,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
  nodeCompleted: {
    backgroundColor: '#F6B44A',
  },
  nodeCurrent: {
    backgroundColor: '#4A90D9',
    borderRadius: 46,
    borderWidth: 5,
    borderColor: '#FFFFFF',
  },
  nodeLocked: {
    backgroundColor: '#D8E0EA',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: 22,
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  badgeCompleted: {
    backgroundColor: '#6BCB77',
  },
  badgeLocked: {
    backgroundColor: '#9FB1C6',
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2E6FB7',
    marginTop: 8,
  },
  nameLocked: {
    color: '#9FB1C6',
  },
  currentPill: {
    marginTop: 6,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#A9CBF0',
  },
  currentLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4A90D9',
  },
});
