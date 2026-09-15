import { Alert, Platform } from 'react-native';

export function notify(message: string): void {
  if (Platform.OS === 'web') {
    window.alert(message);
  } else {
    Alert.alert('Aviso', message);
  }
}
