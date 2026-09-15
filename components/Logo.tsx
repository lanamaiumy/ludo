import { Image, StyleSheet } from 'react-native';

type Props = {
  size?: number;
};

const RATIO = 127 / 48;

export default function Logo({ size = 40 }: Props) {
  return (
    <Image
      source={require('../assets/images/ludo.png')}
      style={[styles.image, { height: size, width: size * RATIO }]}
      resizeMode="contain"
    />
  );
}

const styles = StyleSheet.create({
  image: {
    alignSelf: 'center',
  },
});
