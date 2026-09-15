import { AVPlaybackSource } from 'expo-av';

export type Sound = {
  id: string;
  name: string;
  description: string;
  file: AVPlaybackSource;
  softFile?: AVPlaybackSource;
};
