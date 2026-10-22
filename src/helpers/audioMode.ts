import { Audio, InterruptionModeAndroid, InterruptionModeIOS } from 'expo-av';

export function configureAudioMode(): Promise<void> {
  return Audio.setAudioModeAsync({
    playsInSilentModeIOS: true,
    interruptionModeIOS: InterruptionModeIOS.DoNotMix,
    interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
    shouldDuckAndroid: true,
    staysActiveInBackground: false,
    playThroughEarpieceAndroid: false,
  });
}
