import { StyleSheet, View } from 'react-native';
import { Scenario } from '../src/types/Scenario';
import ScenarioNode from './ScenarioNode';
import TrailSegment from './TrailSegment';

type Props = {
  scenarios: Scenario[];
  onSelect: (scenario: Scenario) => void;
};

const SIDE_OFFSET = 72;

function offsetAt(index: number) {
  return index % 2 === 0 ? SIDE_OFFSET : -SIDE_OFFSET;
}

export default function JourneyTrail({ scenarios, onSelect }: Props) {
  return (
    <View style={styles.container}>
      {scenarios.map((scenario, index) => (
        <View key={scenario.id} style={styles.step}>
          <View style={{ transform: [{ translateX: offsetAt(index) }] }}>
            <ScenarioNode scenario={scenario} onPress={() => onSelect(scenario)} />
          </View>

          {index < scenarios.length - 1 && (
            <TrailSegment from={offsetAt(index)} to={offsetAt(index + 1)} />
          )}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'stretch',
    alignItems: 'center',
  },
  step: {
    alignSelf: 'stretch',
    alignItems: 'center',
  },
});
