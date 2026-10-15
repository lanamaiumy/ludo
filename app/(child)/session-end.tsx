import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import GradientBackground from '../../components/GradientBackground';
import Mascot from '../../components/Mascot';
import RewardStar from '../../components/RewardStar';
import { useActiveChild } from '../../src/contexts/ActiveChildContext';
import { useSession } from '../../src/contexts/SessionContext';

export default function SessionEndScreen() {
  const router = useRouter();
  const { activeChild } = useActiveChild();
  const { acknowledgeTimeUp } = useSession();

  function goHome() {
    acknowledgeTimeUp();
    router.replace('/');
  }

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safe}>
        <View style={styles.content}>
          <RewardStar size={88} />
          <Mascot size={180} />
          <Text style={styles.title}>Muito bem{activeChild ? `, ${activeChild.name}` : ''}!</Text>
          <Text style={styles.message}>
            Você ganhou uma estrela por ouvir os sons até o fim do tempo combinado.
          </Text>
          <Text style={styles.message}>
            O tempo de hoje acabou. Você ficou {activeChild?.sessionMinutes ?? 0} minutos ouvindo os sons no seu ritmo.
          </Text>
        </View>
        <Button
          mode="contained"
          icon="home"
          onPress={goHome}
          buttonColor="#4A90D9"
          style={styles.button}
          contentStyle={styles.buttonContent}
          labelStyle={styles.buttonLabel}
        >
          Voltar ao início
        </Button>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    paddingHorizontal: 28,
    paddingBottom: 32,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#2E6FB7',
    marginTop: 24,
    textAlign: 'center',
  },
  message: {
    fontSize: 17,
    color: '#6E8BA8',
    marginTop: 12,
    textAlign: 'center',
    lineHeight: 24,
  },
  button: {
    borderRadius: 30,
  },
  buttonContent: {
    height: 56,
  },
  buttonLabel: {
    fontSize: 18,
    fontWeight: '700',
  },
});
