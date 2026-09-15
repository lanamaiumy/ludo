import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import GradientBackground from '../components/GradientBackground';
import Logo from '../components/Logo';
import Mascot from '../components/Mascot';
import { useAuth } from '../src/contexts/AuthContext';

// utilizamos o router para que as URLs da aplicação sejam geradas, 
// as rotas são iniciada à partir de app, subpastas a pasta app, 
// será uma nova rota na aplicação, a não ser que esteja entre parenteses, nesse caso, 
// pastas entre parenteses não será necessariamente descritas na rota da aplicação 

export default function HomeScreen() {
  const router = useRouter();
  const { token } = useAuth();

  function startJourney() {
    router.push('/(child)/journey');
  }

  function openParentArea() {
    if (token) {
      router.push('/(parent)/children');
    } else {
      router.push('/(parent)/login');
    }
  }

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Logo size={44} />
          <Text style={styles.subtitle}>Som por som, no seu tempo</Text>
        </View>

        <View style={styles.mascotArea}>
          <Mascot size={280} />
        </View>

        <View style={styles.actions}>
          <Button
            mode="contained"
            icon="rocket-launch"
            onPress={startJourney}
            buttonColor="#4A90D9"
            style={styles.primaryButton}
            contentStyle={styles.primaryContent}
            labelStyle={styles.primaryLabel}
          >
            Começar Jornada
          </Button>
          <Button
            mode="contained"
            icon="account-supervisor"
            onPress={openParentArea}
            buttonColor="#E7EEF6"
            textColor="#2E6FB7"
            style={styles.secondaryButton}
            contentStyle={styles.secondaryContent}
          >
            Área dos Responsáveis
          </Button>
        </View>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    paddingHorizontal: 28,
  },
  header: {
    alignItems: 'center',
    marginTop: 32,
  },
  subtitle: {
    fontSize: 17,
    color: '#6E8BA8',
    marginTop: 6,
  },
  mascotArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actions: {
    paddingBottom: 32,
    gap: 14,
  },
  primaryButton: {
    borderRadius: 30,
    elevation: 2,
  },
  primaryContent: {
    height: 58,
  },
  primaryLabel: {
    fontSize: 18,
    fontWeight: '700',
  },
  secondaryButton: {
    borderRadius: 30,
  },
  secondaryContent: {
    height: 52,
  },
});
