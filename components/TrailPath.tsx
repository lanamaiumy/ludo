import { StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

type Point = {
  x: number;
  y: number;
};

type Props = {
  width: number;
  height: number;
  points: Point[];
};

const STROKE_WIDTH = 11;
const DASH_LENGTH = 4;
const DASH_GAP = 22;

function buildPath(points: Point[]) {
  return points
    .map((point, index) => {
      if (index === 0) {
        return `M ${point.x} ${point.y}`;
      }
      const previous = points[index - 1];
      const middle = (previous.y + point.y) / 2;
      return `C ${previous.x} ${middle} ${point.x} ${middle} ${point.x} ${point.y}`;
    })
    .join(' ');
}

export default function TrailPath({ width, height, points }: Props) {
  if (points.length < 2) {
    return null;
  }

  return (
    <View testID="trail-path" pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Svg width={width} height={height}>
        <Path
          d={buildPath(points)}
          fill="none"
          stroke="#7FB2F0"
          strokeWidth={STROKE_WIDTH}
          strokeLinecap="round"
          strokeDasharray={`${DASH_LENGTH} ${DASH_GAP}`}
        />
      </Svg>
    </View>
  );
}
