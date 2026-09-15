import { useState } from 'react';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import GradientBackground from '../../components/GradientBackground';
import Logo from '../../components/Logo';
import LabeledInput from '../../components/LabeledInput';
import api from '../../src/services/api';
import { notify } from '../../src/helpers/notify';

export default function RegisterScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [childName, setChildName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleRegister() {
    if (!name.trim() || !email.trim() || !password.trim()) {
      notify('Preencha nome, email e senha.');
      return;
    }
    if (password.length < 8) {
      notify('A senha precisa ter pelo menos 8 caracteres.');
      return;
    }
    if (password !== confirmPassword) {
      notify('As senhas não conferem.');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/api/collections/users/records', {
        name: name.trim(),
        child_name: childName.trim() || 'Ana',
        email: email.trim(),
        password,
        passwordConfirm: confirmPassword,
      });
      notify('Cadastro criado! Agora faça login.');
      router.replace('/(parent)/login');
    } catch (e) {
      notify('Não foi possível concluir o cadastro. Verifique os dados e tente novamente.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Logo size={44} />
            <Text style={styles.subtitle}>Crie a sua conta</Text>
          </View>

          <LabeledInput label="Seu nome" value={name} onChangeText={setName} placeholder="Digite o seu nome" />
          <LabeledInput
            label="Nome da criança"
            value={childName}
            onChangeText={setChildName}
            placeholder="Ex.: Ana"
          />
          <LabeledInput
            label="E-mail"
            value={email}
            onChangeText={setEmail}
            placeholder="exemplo@exemplo.com"
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <LabeledInput
            label="Senha"
            value={password}
            onChangeText={setPassword}
            placeholder="Mínimo 8 caracteres"
            secureTextEntry
          />
          <LabeledInput
            label="Repita a senha"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="••••••••"
            secureTextEntry
          />

          <Button
            mode="contained"
            onPress={handleRegister}
            loading={submitting}
            disabled={submitting}
            buttonColor="#4A90D9"
            style={styles.primaryButton}
            contentStyle={styles.buttonContent}
            labelStyle={styles.primaryLabel}
          >
            Registre-se
          </Button>
          <Button
            mode="contained"
            onPress={() => router.replace('/(parent)/login')}
            buttonColor="#E7EEF6"
            textColor="#2E6FB7"
            style={styles.secondaryButton}
            contentStyle={styles.buttonContent}
          >
            Já tenho conta
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
    paddingHorizontal: 28,
    paddingTop: 32,
    paddingBottom: 32,
  },
  header: {
    alignItems: 'center',
    marginBottom: 28,
  },
  subtitle: {
    fontSize: 17,
    color: '#6E8BA8',
    marginTop: 6,
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
