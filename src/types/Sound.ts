import { AudioSource } from 'expo-audio';

export type Sound = {
  id: string;
  name: string;
  article: 'o' | 'a' | 'os' | 'as';
  description: string;
  file: AudioSource;
  softFile?: AudioSource;
};
