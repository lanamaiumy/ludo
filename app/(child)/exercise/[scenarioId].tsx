import { useEffect, useMemo, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import GradientBackground from '../../../components/GradientBackground';
import Logo from '../../../components/Logo';
import Mascot from '../../../components/Mascot';
import AudioPlayer from '../../../components/AudioPlayer';
import { scenarios } from '../../../src/data/scenarios';
import { User } from '../../../src/types/User';
import { useProgress } from '../../../src/contexts/ProgressContext';
import { AsyncStorageHelper } from '../../../src/helpers/AsyncStorageHelper';

const CHILD_KEY = 'child_name';
const USER_KEY = 'auth_user';
const VOLUME_KEY = 'max_volume';

export default function ExerciseScreen() {
  const router = useRouter();
  const { scenarioId } = useLocalSearchParams<{ scenarioId: string }>();
  const { markScenarioCompleted, addSession } = useProgress();

  const scenario = useMemo(() => scenarios.find((item) => item.id === scenarioId), [scenarioId]);
  const sound = scenario?.sounds[0];

  const [childName, setChildName] = useState('Ana');
  const [maxVolume, setMaxVolume] = useState(1);
  const [showDescription, setShowDescription] = useState(false);
  const [soft, setSoft] = useState(false);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    async function loadConfig() {
      const name = await AsyncStorageHelper.getString(CHILD_KEY);
      const storedUser = await AsyncStorageHelper.getObject<User>(USER_KEY);
      const savedVolume = await AsyncStorageHelper.getNumber(VOLUME_KEY);
      if (name) {
        setChildName(name);
      } else if (storedUser?.childName) {
        setChildName(storedUser.childName);
      }
      if (savedVolume !== null) {
        setMaxVolume(savedVolume);
      }
    }
    loadConfig();
  }, []);

  async function handleComplete() {
    if (finished || !scenario || !sound) {
      return;
    }
    setFinished(true);
    await markScenarioCompleted(scenario.id);
    await addSession({
      date: new Date().toISOString(),
      scenarioId: scenario.id,
      soundId: sound.id,
      completed: true,
      usedSoftMode: soft,
    });
  }

  if (!scenario || !sound) {
    return (
      <GradientBackground>
        <SafeAreaView style={styles.fallback}>
          <Text variant="titleLarge">Cenário não encontrado</Text>
          <Button mode="contained" onPress={() => router.back()} buttonColor="#4A90D9">
            Voltar
          </Button>
        </SafeAreaView>
      </GradientBackground>
    );
  }

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <Logo size={26} />
          <Button
            mode="contained"
            icon="close-circle"
            onPress={() => router.back()}
            buttonColor="#FFE2E2"
            textColor="#E0556B"
            style={styles.stopButton}
          >
            Pare
          </Button>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.mascotRow}>
            <Mascot size={96} variant="happy" />
            <View style={styles.bubble}>
              <Text style={styles.bubbleText}>
                {childName}, vamos ouvir o {sound.name}?
              </Text>
            </View>
          </View>

          <AudioPlayer
            soundFile={sound.file}
            softFile={sound.softFile}
            maxVolume={maxVolume}
            soundName={sound.name}
            soft={soft}
            onComplete={handleComplete}
          />

          <Button
            mode="contained"
            icon="help-circle-outline"
            onPress={() => setShowDescription(!showDescription)}
            buttonColor="#EEF3FA"
            textColor="#2E6FB7"
            style={styles.pill}
            contentStyle={styles.pillContent}
          >
            O que é este som?
          </Button>
          {showDescription && (
            <Card style={styles.descriptionCard}>
              <Card.Content>
                <Text style={styles.descriptionText}>{sound.description}</Text>
              </Card.Content>
            </Card>
          )}

          <Button
            mode="contained"
            icon="waveform"
            onPress={() => setSoft(!soft)}
            buttonColor={soft ? '#DAF1DE' : '#EEF3FA'}
            textColor={soft ? '#3F9B53' : '#2E6FB7'}
            style={styles.pill}
            contentStyle={styles.pillContent}
          >
            Modo Suave (Frequências reduzidas)
          </Button>

          {finished && (
            <Card style={styles.congratsCard}>
              <Card.Content style={styles.congratsContent}>
                <Text style={styles.congratsText}>Muito bem! Você ouviu o som todo. 🎉</Text>
                <Button
                  mode="contained"
                  buttonColor="#6BCB77"
                  onPress={() => router.back()}
                  style={styles.continueButton}
                  contentStyle={styles.continueContent}
                >
                  Continuar
                </Button>
              </Card.Content>
            </Card>
          )}
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  stopButton: {
    borderRadius: 20,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 48,
  },
  mascotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  bubble: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginLeft: 12,
  },
  bubbleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E6FB7',
  },
  pill: {
    marginTop: 14,
    borderRadius: 18,
  },
  pillContent: {
    height: 52,
  },
  descriptionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginTop: 8,
  },
  descriptionText: {
    fontSize: 15,
    color: '#2E6FB7',
  },
  congratsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginTop: 24,
  },
  congratsContent: {
    alignItems: 'center',
  },
  congratsText: {
    fontSize: 18,
    color: '#3F9B53',
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 16,
  },
  continueButton: {
    alignSelf: 'stretch',
    borderRadius: 24,
  },
  continueContent: {
    height: 50,
  },
  fallback: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
});
