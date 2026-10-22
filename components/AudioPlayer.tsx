import { useEffect, useRef, useState } from 'react';
import { AudioPlayer as Player, AudioSource, useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import Slider from '@react-native-community/slider';
import { StyleSheet, View } from 'react-native';
import { IconButton, Text } from 'react-native-paper';
import { fadeInSteps } from '../src/helpers/fade';

const INITIAL_VOLUME_RATIO = 0.2;
const FADE_IN_MS = 3000;
const FADE_STEP_MS = 100;
const END_TOLERANCE_SECONDS = 0.05;

type Props = {
  soundFile: AudioSource;
  softFile?: AudioSource;
  maxVolume: number;
  soundName: string;
  soft: boolean;
  onComplete: () => void;
};

function setPlayerVolume(player: Player, value: number) {
  player.volume = value;
}

export default function AudioPlayer({
  soundFile,
  softFile,
  maxVolume,
  soundName,
  soft,
  onComplete,
}: Props) {
  const player = useAudioPlayer(soft && softFile ? softFile : soundFile);
  const status = useAudioPlayerStatus(player);
  const [volume, setVolume] = useState(maxVolume * INITIAL_VOLUME_RATIO);
  const fadeTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const isLoaded = status.isLoaded;
  const isPlaying = status.playing;

  function stopFade() {
    if (fadeTimer.current) {
      clearInterval(fadeTimer.current);
      fadeTimer.current = null;
    }
  }

  function fadeIn(target: number) {
    stopFade();
    const steps = fadeInSteps(target, FADE_IN_MS, FADE_STEP_MS);
    let index = 0;
    fadeTimer.current = setInterval(() => {
      if (index >= steps.length) {
        stopFade();
        return;
      }
      setPlayerVolume(player, steps[index]);
      index += 1;
    }, FADE_STEP_MS);
  }

  useEffect(() => {
    setPlayerVolume(player, Math.min(volume, maxVolume));
    return stopFade;
  }, [player]);

  useEffect(() => {
    if (status.didJustFinish) {
      stopFade();
      onComplete();
    }
  }, [status.didJustFinish]);

  async function togglePlay() {
    if (!isLoaded) {
      return;
    }
    if (isPlaying) {
      stopFade();
      player.pause();
      return;
    }
    setPlayerVolume(player, 0);
    if (status.duration > 0 && status.currentTime >= status.duration - END_TOLERANCE_SECONDS) {
      await player.seekTo(0);
    }
    player.play();
    fadeIn(Math.min(volume, maxVolume));
  }

  function changeVolume(value: number) {
    stopFade();
    const limited = Math.min(value, maxVolume);
    setVolume(limited);
    setPlayerVolume(player, limited);
  }

  const progress = status.duration > 0 ? status.currentTime / status.duration : 0;

  return (
    <View style={styles.card}>
      <View style={styles.playCircle}>
        <IconButton
          icon={isPlaying ? 'pause' : 'play'}
          iconColor={isLoaded ? '#2E6FB7' : '#A9B7C7'}
          size={48}
          disabled={!isLoaded}
          accessibilityLabel={isPlaying ? 'Pausar o som' : 'Tocar o som'}
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
