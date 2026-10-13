import { useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, StyleSheet } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import GradientBackground from '../../components/GradientBackground';
import LabeledInput from '../../components/LabeledInput';
import { useActiveChild } from '../../src/contexts/ActiveChildContext';
import { getApiErrorMessage } from '../../src/helpers/apiError';
import { useParentAccess } from '../../src/hooks/useParentAccess';
import { createChild, renameChild } from '../../src/services/children';
import { notify } from '../../src/helpers/notify';

export default function ChildFormScreen() {
  const router = useRouter();
  const hasAccess = useParentAccess();
  const { activeChild, selectChild } = useActiveChild();
  const params = useLocalSearchParams<{
    id?: string;
    name?: string;
  }>();

  const isEditing = Boolean(params.id);
  const [name, setName] = useState(params.name ?? '');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    if (!name.trim()) {
      notify('Informe o nome da criança.');
      return;
    }
    setSubmitting(true);
    try {
      if (isEditing && params.id) {
        const updated = await renameChild(params.id, name.trim()); //patch
        if (activeChild?.id === updated.id) {
          await selectChild(updated);
        }
      } else {
        await createChild(name.trim()); // post
      }
      router.back();
    } catch (e) {
      notify(getApiErrorMessage(e, 'Não foi possível salvar a criança. Tente novamente.'));
    } finally {
      setSubmitting(false);
    }
  }

  if (!hasAccess) {
    return null;
  }

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>{isEditing ? 'Editar criança' : 'Nova criança'}</Text>

          <LabeledInput label="Nome" value={name} onChangeText={setName} placeholder="Ex.: Ana" />

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
