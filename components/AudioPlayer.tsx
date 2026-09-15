import { useEffect, useRef, useState } from 'react';
import { Audio, AVPlaybackSource, AVPlaybackStatus } from 'expo-av';
import Slider from '@react-native-community/slider';
import { StyleSheet, View } from 'react-native';
import { IconButton, Text } from 'react-native-paper';

type Props = {
  soundFile: AVPlaybackSource;
  softFile?: AVPlaybackSource;
  maxVolume: number;
  soundName: string;
  soft: boolean;
  onComplete: () => void;
};

export default function AudioPlayer({
  soundFile,
  softFile,
  maxVolume,
  soundName,
  soft,
  onComplete,
}: Props) {
  const soundRef = useRef<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(1);
  const [volume, setVolume] = useState(maxVolume);

  function handleStatus(status: AVPlaybackStatus) {
    if (!status.isLoaded) {
      setIsLoaded(false);
      return;
    }
    setIsLoaded(true);
    setPosition(status.positionMillis);
    setDuration(status.durationMillis ?? 1);
    setIsPlaying(status.isPlaying);
    if (status.didJustFinish) {
      setIsPlaying(false);
      onComplete();
    }
  }

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        if (soundRef.current) {
          await soundRef.current.unloadAsync();
          soundRef.current = null;
        }
        const source = soft && softFile ? softFile : soundFile;
        const { sound } = await Audio.Sound.createAsync(source, {
          volume: Math.min(volume, maxVolume),
        });
        if (!active) {
          await sound.unloadAsync();
          return;
        }
        soundRef.current = sound;
        sound.setOnPlaybackStatusUpdate(handleStatus);
      } catch (error) {
        setIsLoaded(false);
      }
    }
    load();
    return () => {
      active = false;
      if (soundRef.current) {
        soundRef.current.unloadAsync();
        soundRef.current = null;
      }
    };
  }, [soft, soundFile, softFile]);

  async function togglePlay() {
    const sound = soundRef.current;
    if (!sound || !isLoaded) {
      return;
    }
    try {
      if (isPlaying) {
        await sound.pauseAsync();
      } else if (position >= duration - 50) {
        await sound.replayAsync();
      } else {
        await sound.playAsync();
      }
    } catch (error) {
      setIsPlaying(false);
    }
  }

  async function changeVolume(value: number) {
    const limited = Math.min(value, maxVolume);
    setVolume(limited);
    const sound = soundRef.current;
    if (!sound || !isLoaded) {
      return;
    }
    try {
      await sound.setVolumeAsync(limited);
    } catch (error) {
      setIsLoaded(false);
    }
  }

  const progress = duration > 0 ? position / duration : 0;

  return (
    <View style={styles.card}>
      <View style={styles.playCircle}>
        <IconButton
          icon={isPlaying ? 'pause' : 'play'}
          iconColor={isLoaded ? '#2E6FB7' : '#A9B7C7'}
          size={48}
          disabled={!isLoaded}
          onPress={togglePlay}
        />
      </View>

      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${Math.min(progress, 1) * 100}%` }]} />
      </View>
      <View style={styles.labels}>
        <Text style={styles.label}>Início</Text>
        <Text style={styles.label}>{soundName}</Text>
      </View>

      <View style={styles.volumeRow}>
        <IconButton icon="volume-low" iconColor="#B68A3C" size={22} />
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={maxVolume}
          value={volume}
          disabled={!isLoaded}
          onValueChange={changeVolume}
          minimumTrackTintColor="#F0A93C"
          maximumTrackTintColor="#F3E2BC"
          thumbTintColor="#F0A93C"
        />
        <IconButton icon="volume-high" iconColor="#B68A3C" size={22} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FCEFCF',
    borderRadius: 28,
    padding: 24,
    alignItems: 'center',
  },
  playCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#F4E2B6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressTrack: {
    width: '100%',
    height: 8,
    borderRadius: 4,
    marginTop: 20,
    backgroundColor: '#F3E2BC',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: '#F0A93C',
  },
  labels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 8,
  },
  label: {
    fontSize: 14,
    color: '#A9772B',
    fontWeight: '600',
  },
  volumeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginTop: 8,
  },
  slider: {
    flex: 1,
    height: 40,
  },
});
