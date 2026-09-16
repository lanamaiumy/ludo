import { useState } from 'react';
import { Dimensions, LayoutChangeEvent, StyleSheet, View } from 'react-native';
import { Scenario } from '../src/types/Scenario';
import ScenarioNode from './ScenarioNode';
import TrailPath from './TrailPath';

type Props = {
  scenarios: Scenario[];
  onSelect: (scenario: Scenario) => void;
};

const SIDE_OFFSET = 72;
const BLOCK_HEIGHT = 104;
const BLOCK_GAP = 64;
const NODE_CENTER = 34;

function offsetAt(index: number) {
  return index % 2 === 0 ? SIDE_OFFSET : -SIDE_OFFSET;
}

export default function JourneyTrail({ scenarios, onSelect }: Props) {
  const [width, setWidth] = useState(Dimensions.get('window').width);

  const height = scenarios.length * BLOCK_HEIGHT + (scenarios.length - 1) * BLOCK_GAP;

  const points = scenarios.map((scenario, index) => ({
    x: width / 2 + offsetAt(index),
    y: index * (BLOCK_HEIGHT + BLOCK_GAP) + NODE_CENTER,
  }));

  function measure(event: LayoutChangeEvent) {
    setWidth(event.nativeEvent.layout.width);
  }

  return (
    <View style={styles.container} onLayout={measure}>
      <TrailPath width={width} height={height} points={points} />

      {scenarios.map((scenario, index) => (
        <View
          key={scenario.id}
          style={[
            styles.block,
            index < scenarios.length - 1 && styles.blockSpacing,
            { transform: [{ translateX: offsetAt(index) }] },
          ]}
        >
          <ScenarioNode scenario={scenario} onPress={() => onSelect(scenario)} />
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
  block: {
    height: BLOCK_HEIGHT,
    alignItems: 'center',
  },
  blockSpacing: {
    marginBottom: BLOCK_GAP,
  },
});
