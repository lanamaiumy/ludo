import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import GradientBackground from '../../components/GradientBackground';
import Mascot from '../../components/Mascot';
import WeekUsage from '../../components/WeekUsage';
import LabeledInput from '../../components/LabeledInput';
import { useAuth } from '../../src/contexts/AuthContext';
import { useProgress } from '../../src/contexts/ProgressContext';
import { AsyncStorageHelper } from '../../src/helpers/AsyncStorageHelper';
import api from '../../src/services/api';
import { notify } from '../../src/helpers/notify';

const VOLUME_KEY = 'max_volume';
const SESSION_KEY = 'session_time';
const CHILD_KEY = 'child_name';
const SESSION_OPTIONS = [5, 10, 15];

export default function SettingsScreen() {
  const router = useRouter();
  const { user, token, isLoading } = useAuth();
  const { weekUsage } = useProgress();
  const [childName, setChildName] = useState('');
  const [volume, setVolume] = useState(1);
  const [sessionTime, setSessionTime] = useState(10);

  useEffect(() => {
    if (!isLoading && !token) {
      router.replace('/(parent)/login');
    }
  }, [isLoading, token, router]);

  useEffect(() => {
    async function loadSettings() {
      const savedVolume = await AsyncStorageHelper.getNumber(VOLUME_KEY);
      const savedSession = await AsyncStorageHelper.getNumber(SESSION_KEY);
      const savedChild = await AsyncStorageHelper.getString(CHILD_KEY);
      setVolume(savedVolume ?? user?.maxVolume ?? 1);
      setSessionTime(savedSession ?? user?.sessionTime ?? 10);
      setChildName(savedChild ?? user?.childName ?? 'Ana');
    }
    loadSettings();
  }, [user]);

  async function patchUser(data: Record<string, unknown>) {
    if (!user) {
      return;
    }
    try {
      await api.patch(`/api/collections/users/records/${user.id}`, data);
    } catch (e) {
      notify('Não foi possível salvar no servidor. A alteração ficou salva no aparelho.');
    }
  }

  async function handleVolumeChange(value: number) {
    setVolume(value);
    await AsyncStorageHelper.setNumber(VOLUME_KEY, value);
    await patchUser({ max_volume: value });
  }

  async function handleSessionChange(value: number) {
    setSessionTime(value);
    await AsyncStorageHelper.setNumber(SESSION_KEY, value);
    await patchUser({ session_time: value });
  }

  async function handleSaveChild() {
    await AsyncStorageHelper.setString(CHILD_KEY, childName.trim() || 'Ana');
    await patchUser({ child_name: childName.trim() || 'Ana' });
    notify('Nome salvo!');
  }

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Card style={styles.headerCard}>
            <Card.Content style={styles.headerContent}>
              <Mascot size={120} variant="happy" />
              <Text style={styles.title}>Configurações dos Pais</Text>
              <Text style={styles.subtitle}>
                Gerencie o nome da criança, o volume máximo, o tempo das sessões e acompanhe a
                utilização semanal.
              </Text>
            </Card.Content>
          </Card>

          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.sectionHeader}>
                <MaterialCommunityIcons name="account-child" size={22} color="#4A90D9" />
                <Text style={styles.sectionTitle}>Nome da criança</Text>
              </View>
              <LabeledInput label="" value={childName} onChangeText={setChildName} placeholder="Ex.: Ana" />
              <Button mode="text" textColor="#4A90D9" onPress={handleSaveChild}>
                Salvar nome
              </Button>
            </Card.Content>
          </Card>

          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.sectionHeader}>
                <MaterialCommunityIcons name="volume-high" size={22} color="#4A90D9" />
                <Text style={styles.sectionTitle}>Volume máximo</Text>
              </View>
              <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={1}
                value={volume}
                onSlidingComplete={handleVolumeChange}
                minimumTrackTintColor="#2E6FB7"
                maximumTrackTintColor="#D6E2F0"
                thumbTintColor="#2E6FB7"
              />
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
                    mode={sessionTime === option ? 'contained' : 'contained-tonal'}
                    onPress={() => handleSessionChange(option)}
                    style={styles.sessionButton}
                    buttonColor={sessionTime === option ? '#2E6FB7' : '#DCEBFF'}
                    textColor={sessionTime === option ? '#FFFFFF' : '#2E6FB7'}
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
    fontSize: 17,
    fontWeight: '700',
    color: '#2E6FB7',
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
