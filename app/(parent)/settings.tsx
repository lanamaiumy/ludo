import { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Card, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import GradientBackground from '../../components/GradientBackground';
import Mascot from '../../components/Mascot';
import WeekUsage from '../../components/WeekUsage';
import { useActiveChild } from '../../src/contexts/ActiveChildContext';
import { getApiErrorMessage } from '../../src/helpers/apiError';
import { notify } from '../../src/helpers/notify';
import { useParentAccess } from '../../src/hooks/useParentAccess';
import { getChild, restoreDefaultSettings, saveChildSettings } from '../../src/services/children';
import { getWeekUsage } from '../../src/services/sessions';
import { Child, SessionMinutes } from '../../src/types/Child';

const SESSION_OPTIONS: SessionMinutes[] = [5, 10];
const EMPTY_WEEK = [false, false, false, false, false, false, false];

export default function SettingsScreen() {
  const router = useRouter();
  const hasAccess = useParentAccess();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { activeChild, selectChild } = useActiveChild();
  const [child, setChild] = useState<Child | null>(null);
  const [volume, setVolume] = useState(0.5);
  const [weekUsage, setWeekUsage] = useState<boolean[]>(EMPTY_WEEK);

  useEffect(() => {
    if (!hasAccess || !id) {
      return;
    }
    getChild(id)
      .then((loaded) => {
        setChild(loaded);
        setVolume(loaded.maxVolume);
      })
      .catch((e) => {
        notify(getApiErrorMessage(e, 'Não foi possível carregar a configuração.'));
        router.back();
      });
    getWeekUsage(id)
      .then(setWeekUsage)
      .catch(() => setWeekUsage(EMPTY_WEEK));
  }, [hasAccess, id, router]);

  async function applyUpdate(request: Promise<Child>) {
    try {
      const updated = await request;
      setChild(updated);
      setVolume(updated.maxVolume);
      if (activeChild?.id === updated.id) {
        await selectChild(updated);
      }
    } catch (e) {
      notify(getApiErrorMessage(e, 'Não foi possível salvar a configuração.'));
      if (child) {
        setVolume(child.maxVolume);
      }
    }
  }

  function handleVolumeChange(value: number) {
    if (child) {
      applyUpdate(saveChildSettings(child.id, { maxVolume: value, sessionMinutes: child.sessionMinutes }));
    }
  }

  function handleSessionChange(value: SessionMinutes) {
    if (child) {
      applyUpdate(saveChildSettings(child.id, { maxVolume: child.maxVolume, sessionMinutes: value }));
    }
  }

  function handleRestoreDefault() {
    if (child) {
      applyUpdate(restoreDefaultSettings(child.id));
    }
  }

  if (!hasAccess) {
    return null;
  }

  if (!child) {
    return (
      <GradientBackground>
        <SafeAreaView style={styles.loading}>
          <ActivityIndicator color="#4A90D9" />
        </SafeAreaView>
      </GradientBackground>
    );
  }

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Card style={styles.headerCard}>
            <Card.Content style={styles.headerContent}>
              <Mascot size={120} variant="happy" />
              <Text style={styles.title}>Configurações dos Pais</Text>
              <Text style={styles.childName}>{child.name}</Text>
              <Text style={styles.subtitle}>
                Gerencie o volume máximo permitido, tempo das sessões e acompanhe a utilização semanal.
              </Text>
            </Card.Content>
          </Card>

          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.sectionHeader}>
                <MaterialCommunityIcons name="volume-high" size={22} color="#4A90D9" />
                <Text style={styles.sectionTitle}>Volume máximo</Text>
                <Text style={styles.sectionValue}>{Math.round(volume * 100)}%</Text>
              </View>
              <Slider
                style={styles.slider}
                minimumValue={0.01}
                maximumValue={1}
                value={volume}
                onValueChange={setVolume}
                onSlidingComplete={handleVolumeChange}
                minimumTrackTintColor="#2E6FB7"
                maximumTrackTintColor="#D6E2F0"
                thumbTintColor="#2E6FB7"
              />
              <Button mode="text" icon="restore" textColor="#6E8BA8" compact onPress={handleRestoreDefault}>
                Retornar a configuração padrão
              </Button>
            </Card.Content>
          </Card>

          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.sectionHeader}>
                <MaterialCommunityIcons name="alarm" size={22} color="#4A90D9" />
                <Text style={styles.sectionTitle}>Tempo de Sessão</Text>
              </View>
              <View style={styles.sessionRow}>
                {SESSION_OPTIONS.map((option) => (
                  <Button
                    key={option}
                    mode={child.sessionMinutes === option ? 'contained' : 'contained-tonal'}
                    onPress={() => handleSessionChange(option)}
                    style={styles.sessionButton}
                    buttonColor={child.sessionMinutes === option ? '#2E6FB7' : '#DCEBFF'}
                    textColor={child.sessionMinutes === option ? '#FFFFFF' : '#2E6FB7'}
                  >
                    {option} min
                  </Button>
                ))}
              </View>
            </Card.Content>
          </Card>

          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.sectionHeader}>
                <MaterialCommunityIcons name="chart-line" size={22} color="#4A90D9" />
                <Text style={styles.sectionTitle}>Utilização da semana</Text>
              </View>
              <WeekUsage usage={weekUsage} />
            </Card.Content>
          </Card>

          <Button
            mode="contained"
            icon="arrow-left"
            onPress={() => router.back()}
            buttonColor="#E7EEF6"
            textColor="#2E6FB7"
            style={styles.backButton}
            contentStyle={styles.backContent}
          >
            Voltar para as crianças
          </Button>
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
  },
  content: {
    padding: 20,
  },
  headerCard: {
    backgroundColor: '#DCEBFF',
    borderRadius: 24,
    marginBottom: 16,
  },
  headerContent: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#2E6FB7',
    marginTop: 8,
  },
  childName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#22466B',
    marginTop: 4,
  },
  subtitle: {
    fontSize: 13,
    color: '#6E8BA8',
    textAlign: 'center',
    marginTop: 8,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  sectionTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
    color: '#2E6FB7',
  },
  sectionValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#6E8BA8',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sessionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  sessionButton: {
    flex: 1,
    borderRadius: 16,
  },
  backButton: {
    marginTop: 8,
    borderRadius: 30,
  },
  backContent: {
    height: 50,
  },
});
