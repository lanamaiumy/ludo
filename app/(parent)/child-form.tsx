import { useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, StyleSheet } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import GradientBackground from '../../components/GradientBackground';
import LabeledInput from '../../components/LabeledInput';
import { useAuth } from '../../src/contexts/AuthContext';
import api from '../../src/services/api';
import { notify } from '../../src/helpers/notify';

export default function ChildFormScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const params = useLocalSearchParams<{
    id?: string;
    name?: string;
    age?: string;
    notes?: string;
  }>();

  const isEditing = Boolean(params.id);
  const [name, setName] = useState(params.name ?? '');
  const [age, setAge] = useState(params.age ?? '');
  const [notes, setNotes] = useState(params.notes ?? '');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    if (!user) {
      notify('Você precisa estar logado.');
      return;
    }
    if (!name.trim()) {
      notify('Informe o nome da criança.');
      return;
    }
    const body = {
      user: user.id,
      name: name.trim(),
      age: Number(age) || 0,
      notes: notes.trim(),
    };
    setSubmitting(true);
    try {
      if (isEditing) { 
        await api.patch(`/api/collections/children/records/${params.id}`, body); //patch
      } else {
        await api.post('/api/collections/children/records', body); // post
      }
      router.back();
    } catch (e) {
      notify('Não foi possível salvar a criança. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>{isEditing ? 'Editar criança' : 'Nova criança'}</Text>

          <LabeledInput label="Nome" value={name} onChangeText={setName} placeholder="Ex.: Ana" />
          <LabeledInput
            label="Idade"
            value={age}
            onChangeText={setAge}
            placeholder="Ex.: 6"
            keyboardType="numeric"
          />
          <LabeledInput
            label="Observações"
            value={notes}
            onChangeText={setNotes}
            placeholder="Ex.: sensível a sons altos"
          />

          <Button
            mode="contained"
            onPress={handleSubmit}
            loading={submitting}
            disabled={submitting}
            buttonColor="#4A90D9"
            style={styles.submitButton}
            contentStyle={styles.submitContent}
            labelStyle={styles.submitLabel}
          >
            {isEditing ? 'Salvar' : 'Criar'}
          </Button>
          <Button mode="text" textColor="#8AA0B8" onPress={() => router.back()}>
            Cancelar
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
    padding: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#2E6FB7',
    marginBottom: 24,
  },
  submitButton: {
    borderRadius: 28,
    marginTop: 20,
  },
  submitContent: {
    height: 52,
  },
  submitLabel: {
    fontSize: 17,
    fontWeight: '700',
  },
});
