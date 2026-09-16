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
  const iconColor = current ? '#3E8BD8' : completed ? '#D98E24' : '#AFC0D4';

  return (
    <View style={styles.container}>
      <View style={styles.nodeArea}>
        <TouchableRipple
          testID={`node-${scenario.id}`}
          borderless
          disabled={locked}
          onPress={onPress}
          style={[styles.node, nodeStyle]}
        >
          <MaterialCommunityIcons name={iconName} size={current ? 34 : 30} color={iconColor} />
        </TouchableRipple>

        {completed && (
          <View testID="badge-completed" style={[styles.badge, styles.badgeCompleted]}>
            <MaterialCommunityIcons name="check" size={13} color="#FFFFFF" />
          </View>
        )}
        {locked && (
          <View testID="badge-locked" style={[styles.badge, styles.badgeLocked]}>
            <MaterialCommunityIcons name="lock" size={12} color="#FFFFFF" />
          </View>
        )}
      </View>

      {current ? (
        <View style={styles.currentPill}>
          <Text style={styles.currentLabel}>{`Cenário: ${scenario.name}`}</Text>
        </View>
      ) : (
        <Text style={[styles.name, locked && styles.nameLocked]}>{scenario.name}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  nodeArea: {
    height: 68,
    alignItems: 'center',
    justifyContent: 'center',
  },
  node: {
    width: 64,
    height: 64,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
  },
  nodeCompleted: {
    backgroundColor: '#FCE0A0',
  },
  nodeCurrent: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#FFFFFF',
    borderWidth: 4,
    borderColor: '#4A90D9',
    elevation: 5,
  },
  nodeLocked: {
    backgroundColor: '#EDF3FA',
  },
  badge: {
    position: 'absolute',
    top: -5,
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  badgeCompleted: {
    right: -5,
    backgroundColor: '#6BCB77',
  },
  badgeLocked: {
    left: -5,
    backgroundColor: '#9FB1C6',
  },
  name: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2E6FB7',
    marginTop: 6,
  },
  nameLocked: {
    color: '#9FB1C6',
  },
  currentPill: {
    marginTop: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: '#BBD8F5',
  },
  currentLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#3E8BD8',
  },
});
