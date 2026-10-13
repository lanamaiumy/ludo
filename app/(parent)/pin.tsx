import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import GradientBackground from '../../components/GradientBackground';
import LabeledInput from '../../components/LabeledInput';
import Logo from '../../components/Logo';
import PinPad from '../../components/PinPad';
import { useAuth } from '../../src/contexts/AuthContext';
import { getApiErrorMessage, getApiErrorStatus } from '../../src/helpers/apiError';
import api from '../../src/services/api';

type Mode = 'verify' | 'create' | 'reset';
type Step = 'password' | 'choose' | 'confirm';

const PIN_LENGTH = 4;

function subtitleFor(mode: Mode, step: Step): string {
  if (mode === 'verify') {
    return 'Digite o PIN';
  }
  if (step === 'password') {
    return 'Para criar um novo PIN, confirme a senha da sua conta';
  }
  if (step === 'confirm') {
    return 'Confirme o PIN';
  }
  return mode === 'create' ? 'Crie um PIN de 4 números' : 'Escolha o novo PIN';
}

export default function PinScreen() {
  const router = useRouter();
  const { user, token, isLoading, markPinCreated, unlockParentArea } = useAuth();
  const [mode, setMode] = useState<Mode>('verify');
  const [step, setStep] = useState<Step>('choose');
  const [pin, setPin] = useState('');
  const [firstPin, setFirstPin] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isLoading) {
      return;
    }
    if (!token || !user) {
      router.replace('/(parent)/login');
    } else if (!user.hasPin && mode === 'verify') {
      setMode('create');
    }
  }, [isLoading, token, user, mode, router]);

  useEffect(() => {
    if (pin.length === PIN_LENGTH && !submitting) {
      handlePinComplete(pin);
    }
  }, [pin]);

  function enterParentArea() {
    unlockParentArea();
    router.replace('/(parent)/children');
  }

  function restartChoice(text: string) {
    setFirstPin('');
    setStep('choose');
    setMessage(text);
  }

  async function handlePinComplete(value: string) {
    setPin('');
    setMessage(null);

    if (mode === 'verify') {
      await verifyPin(value);
    } else if (step === 'choose') {
      setFirstPin(value);
      setStep('confirm');
    } else if (value !== firstPin) {
      restartChoice('Os PINs não conferem. Vamos tentar de novo.');
    } else {
      await savePin(value);
    }
  }

  async function verifyPin(value: string) {
    setSubmitting(true);
    try {
      await api.post('/auth/pin/verificar', { pin: value });
      enterParentArea();
    } catch (error) {
      const status = getApiErrorStatus(error);
      if (status === 409) {
        setMode('create');
        restartChoice('Você ainda não tem um PIN. Crie um agora.');
      } else {
        setMessage(status === 403 ? 'PIN incorreto. Tente de novo.' : getApiErrorMessage(error, 'Não foi possível conferir o PIN.'));
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function savePin(value: string) {
    setSubmitting(true);
    try {
      if (mode === 'create') {
        await api.post('/auth/pin', { pin: value });
        await markPinCreated();
      } else {
        await api.put('/auth/pin', { senha: password, pin: value });
      }
      enterParentArea();
    } catch (error) {
      if (mode === 'reset' && getApiErrorStatus(error) === 403) {
        setPassword('');
        setFirstPin('');
        setStep('password');
        setMessage('Senha incorreta. Confirme a senha da sua conta.');
      } else {
        restartChoice(getApiErrorMessage(error, 'Não foi possível salvar o PIN.'));
      }
    } finally {
      setSubmitting(false);
    }
  }

  function startReset() {
    setMode('reset');
    setStep('password');
    setPin('');
    setFirstPin('');
    setMessage(null);
  }

  function cancelReset() {
    setMode('verify');
    setStep('choose');
    setPin('');
    setFirstPin('');
    setPassword('');
    setMessage(null);
  }

  function confirmPassword() {
    if (!password) {
      setMessage('Informe a senha da sua conta.');
      return;
    }
    setMessage(null);
    setStep('choose');
  }

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Logo size={44} />
          <Text style={styles.title}>Área dos Pais</Text>
          <Text style={styles.subtitle}>{subtitleFor(mode, step)}</Text>
          {message && <Text style={styles.message}>{message}</Text>}
        </View>

        {step === 'password' ? (
          <View style={styles.passwordForm}>
            <LabeledInput
              label="Senha da conta"
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              secureTextEntry
            />
            <Button
              mode="contained"
              onPress={confirmPassword}
              buttonColor="#4A90D9"
              style={styles.continueButton}
              contentStyle={styles.continueContent}
            >
              Continuar
            </Button>
          </View>
        ) : (
          <PinPad value={pin} onChange={setPin} length={PIN_LENGTH} disabled={submitting} />
        )}

        {mode === 'verify' && (
          <Button mode="text" textColor="#5B7896" onPress={startReset}>
            Esqueceu o PIN?
          </Button>
        )}
        {mode === 'reset' && (
          <Button mode="text" textColor="#5B7896" onPress={cancelReset}>
            Cancelar
          </Button>
        )}
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    paddingHorizontal: 28,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 28,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#22466B',
    marginTop: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#22466B',
    marginTop: 20,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    color: '#E0556B',
    marginTop: 10,
    textAlign: 'center',
  },
  passwordForm: {
    marginBottom: 16,
  },
  continueButton: {
    borderRadius: 30,
  },
  continueContent: {
    height: 52,
  },
});
