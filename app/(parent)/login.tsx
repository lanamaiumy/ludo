import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import GradientBackground from '../../components/GradientBackground';
import Logo from '../../components/Logo';
import LabeledInput from '../../components/LabeledInput';
import { useAuth } from '../../src/contexts/AuthContext';
import { notify } from '../../src/helpers/notify';

export default function LoginScreen() {
  const router = useRouter();
  const { login, token, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && token) { // se temos um token armazenado no Async Storage, liberamos direto para /(parent)/sessions
      router.replace('/(parent)/children');
    }
  }, [isLoading, token, router]);

  async function handleLogin() {
    if (!email.trim() || !password.trim()) {
      notify('Preencha o email e a senha.');
      return;
    }
    setSubmitting(true);
    try {
      await login(email.trim(), password);
      router.replace('/(parent)/children'); //acesso liberado pós login()
    } catch (e) {
      notify('Não foi possível fazer login. Verifique seu email e senha.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Logo size={44} />
          <Text style={styles.subtitle}>Faça login ou registre-se!</Text>
        </View>

        <View style={styles.form}>
          <LabeledInput
            label="Digite o seu e-mail"
            value={email}
            onChangeText={setEmail}
            placeholder="exemplo@exemplo.com"
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <LabeledInput
            label="Digite a sua senha"
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            secureTextEntry
          />

          <Button
            mode="contained"
            onPress={handleLogin}
            loading={submitting}
            disabled={submitting}
            buttonColor="#4A90D9"
            style={styles.primaryButton}
            contentStyle={styles.buttonContent}
            labelStyle={styles.primaryLabel}
          >
            Login
          </Button>
          <Button
            mode="contained"
            onPress={() => router.push('/(parent)/register')}
            buttonColor="#E7EEF6"
            textColor="#2E6FB7"
            style={styles.secondaryButton}
            contentStyle={styles.buttonContent}
          >
            Registre-se
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
    marginTop: 48,
    marginBottom: 32,
  },
  subtitle: {
    fontSize: 17,
    color: '#6E8BA8',
    marginTop: 6,
  },
  form: {
    flex: 1,
  },
  primaryButton: {
    borderRadius: 30,
    marginTop: 8,
    marginBottom: 14,
  },
  secondaryButton: {
    borderRadius: 30,
  },
  buttonContent: {
    height: 54,
  },
  primaryLabel: {
    fontSize: 17,
    fontWeight: '700',
  },
});
