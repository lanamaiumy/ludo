import { AVPlaybackSource } from 'expo-av';

export type Sound = {
  id: string;
  name: string;
  article: 'o' | 'a' | 'os' | 'as';
  description: string;
  file: AVPlaybackSource;
  softFile?: AVPlaybackSource;
};
