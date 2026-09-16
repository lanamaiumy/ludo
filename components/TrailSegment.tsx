import { StyleSheet, View } from 'react-native';

type Props = {
  from: number;
  to: number;
};

const DASH_COUNT = 8;
const SLOT_HEIGHT = 13;
const SEGMENT_HEIGHT = DASH_COUNT * SLOT_HEIGHT;

function easeInOut(progress: number) {
  return progress * progress * (3 - 2 * progress);
}

function easeInOutSlope(progress: number) {
  return 6 * progress * (1 - progress);
}

export default function TrailSegment({ from, to }: Props) {
  const travel = to - from;

  const dashes = Array.from({ length: DASH_COUNT }, (_, index) => {
    const progress = (index + 0.5) / DASH_COUNT;
    const offset = from + travel * easeInOut(progress);
    const slope = travel * easeInOutSlope(progress);
    const angle = (Math.atan2(-slope, SEGMENT_HEIGHT) * 180) / Math.PI;
    return { index, offset, angle };
  });

  return (
    <View testID="trail-segment" style={styles.container}>
      {dashes.map((dash) => (
        <View key={dash.index} style={styles.slot}>
          <View
            style={[
              styles.dash,
              { transform: [{ translateX: dash.offset }, { rotate: `${dash.angle}deg` }] },
            ]}
          />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: SEGMENT_HEIGHT,
    alignSelf: 'stretch',
  },
  slot: {
    height: SLOT_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dash: {
    width: 7,
    height: 9,
    borderRadius: 4,
    backgroundColor: '#7FB2F0',
  },
});
