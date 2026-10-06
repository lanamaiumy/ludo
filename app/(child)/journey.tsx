import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Text, TouchableRipple } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
// componentes
import GradientBackground from '../../components/GradientBackground';
import JourneyTrail from '../../components/JourneyTrail';
// scenarios e contexto (useProgress())
// os scenarios funcionam como objetos pré-definidos na aplicação, os scenarios são concluidos
// de acordo com o que o useProgress() nos retorna na variavel const completedScenarios
import { scenarios } from '../../src/data/scenarios';
import { Scenario } from '../../src/types/Scenario';
import { useProgress } from '../../src/contexts/ProgressContext'; //useProgress()
import { useAuth } from '../../src/contexts/AuthContext';

// essa é a rota de telas das crianças, é aqui que montamos nossa página com os componentes

export default function JourneyScreen() {
  const router = useRouter();
  const { completedScenarios } = useProgress();
  const { token } = useAuth();

  function openParentArea() {
    if (token) {
      router.push('/(parent)/children');
    } else {
      router.push('/(parent)/login');
    }
  }

  function resolveStatus(scenario: Scenario): Scenario {
    if (completedScenarios.includes(scenario.id) && scenario.status !== 'completed') {
      return { ...scenario, status: 'completed' };
    }
    return scenario;
  }

  const ordered = [...scenarios].sort((a, b) => a.order - b.order).map(resolveStatus);
  const display = [...ordered].reverse();

  function openExercise(scenario: Scenario) {
    if (scenario.status === 'locked') {
      return;
    }
    router.push({
      pathname: '/(child)/exercise/[scenarioId]',
      params: { scenarioId: scenario.id },
    });
  }

  function goToCurrent() {
    const current = ordered.find((item) => item.status === 'unlocked');
    if (current) {
      openExercise(current);
    }
  }

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.trail}
          showsVerticalScrollIndicator={false}
        >
          <JourneyTrail scenarios={display} onSelect={openExercise} />
        </ScrollView>
      </SafeAreaView>

      <SafeAreaView edges={['bottom']} style={styles.tabBarSafe}>
        <View style={styles.tabBar}>
          <TouchableRipple borderless style={styles.tab} onPress={() => router.replace('/')}>
            <View style={styles.tabInner}>
              <MaterialCommunityIcons name="home" size={26} color="#6E8BA8" />
              <Text style={styles.tabLabel}>Início</Text>
            </View>
          </TouchableRipple>

          <TouchableRipple borderless style={styles.playTab} onPress={goToCurrent}>
            <MaterialCommunityIcons name="play" size={32} color="#FFFFFF" />
          </TouchableRipple>

          <TouchableRipple borderless style={styles.tab} onPress={openParentArea}>
            <View style={styles.tabInner}>
              <MaterialCommunityIcons name="cog" size={26} color="#6E8BA8" />
              <Text style={styles.tabLabel}>Config</Text>
            </View>
          </TouchableRipple>
        </View>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  trail: {
    alignItems: 'center',
    paddingVertical: 28,
  },
  tabBarSafe: {
    backgroundColor: '#FFFFFF',
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EAF0F7',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
  },
  tabInner: {
    alignItems: 'center',
    gap: 2,
  },
  tabLabel: {
    fontSize: 12,
    color: '#6E8BA8',
  },
  playTab: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#4A90D9',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -24,
    elevation: 4,
  },
});
