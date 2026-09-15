import { LinearGradient } from 'expo-linear-gradient';
import { ReactNode } from 'react';
import { StyleSheet, ViewStyle } from 'react-native';

type Props = {
  children: ReactNode;
  style?: ViewStyle;
};

export default function GradientBackground({ children, style }: Props) {
  return (
    <LinearGradient colors={['#D6E9FF', '#F4F8FF']} style={[styles.gradient, style]}>
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
    backgroundColor: '#DCEEFF',
  },
});
