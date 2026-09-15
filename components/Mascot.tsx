import { Image, StyleSheet } from 'react-native';

type Props = {
  size?: number;
  variant?: 'default' | 'happy';
};

export default function Mascot({ size = 160 }: Props) {
  return (
    <Image
      source={require('../assets/images/logo.png')}
      style={[styles.image, { width: size, height: size }]}
      resizeMode="contain"
    />
  );
}

const styles = StyleSheet.create({
  image: {
    alignSelf: 'center',
  },
});
