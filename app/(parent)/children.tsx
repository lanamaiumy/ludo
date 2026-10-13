import { useCallback, useEffect, useState } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import { FlatList, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Card, IconButton, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import GradientBackground from '../../components/GradientBackground';
import { useActiveChild } from '../../src/contexts/ActiveChildContext';
import { useAuth } from '../../src/contexts/AuthContext';
import { getApiErrorMessage } from '../../src/helpers/apiError';
import { useParentAccess } from '../../src/hooks/useParentAccess';
import { deleteChild, listChildren } from '../../src/services/children';
import { notify } from '../../src/helpers/notify';
import { Child } from '../../src/types/Child';

export default function ChildrenScreen() {
  const router = useRouter();
  const hasAccess = useParentAccess();
  const { logout, lockParentArea } = useAuth();
  const { activeChild, selectChild, syncWithChildren } = useActiveChild();
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => lockParentArea, [lockParentArea]);

  // padrão para chamada api: await api.verbo(url, corpo/parametros)

  const loadChildren = useCallback(async () => { //get
    if (!hasAccess) {
      return;
    }
    setLoading(true);
    try {
      const list = await listChildren(); //get
      setChildren(list);
      await syncWithChildren(list);
    } catch (e) {
      notify(getApiErrorMessage(e, 'Não foi possível carregar as crianças. Verifique a conexão.'));
    } finally {
      setLoading(false);
    }
  }, [hasAccess, syncWithChildren]);

  useFocusEffect(
    useCallback(() => {
      loadChildren();
    }, [loadChildren])
  );

  async function handleDelete(id: string) {
    try {
      await deleteChild(id); //delete
      const remaining = children.filter((item) => item.id !== id);
      setChildren(remaining);
      await syncWithChildren(remaining);
    } catch (e) {
      notify(getApiErrorMessage(e, 'Não foi possível excluir a criança.'));
    }
  }

  async function handleLogout() {
    router.replace('/');
    await logout();
  }

  function goToJourney() {
    router.replace('/');
  }

  function editChild(item: Child) {
    router.push({
      pathname: '/(parent)/child-form',
      params: {
        id: item.id,
        name: item.name,
      },
    });
  }

  function openSettings(item: Child) {
    router.push({
      pathname: '/(parent)/settings',
      params: { id: item.id },
    });
  }

  if (!hasAccess) {
    return null;
  }

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Text style={styles.title}>Crianças</Text>
          <View style={styles.headerActions}>
            <IconButton icon="home" iconColor="#2E6FB7" accessibilityLabel="Voltar para a jornada" onPress={goToJourney} />
            <IconButton icon="logout" iconColor="#FF7A7A" accessibilityLabel="Sair da conta" onPress={handleLogout} />
          </View>
        </View>

        <Text style={styles.helper}>
          Toque em uma criança para ajustar o volume e o tempo de sessão. A estrela marca quem usa a jornada neste aparelho.
        </Text>

        <Button
          mode="contained"
          icon="plus"
          buttonColor="#4A90D9"
          style={styles.newButton}
          contentStyle={styles.newButtonContent}
          onPress={() => router.push('/(parent)/child-form')}
        >
          Nova criança
        </Button>

        {loading && <ActivityIndicator color="#4A90D9" style={styles.loader} />}

        <FlatList
          contentContainerStyle={styles.list}
          data={children} // array do get
          keyExtractor={(item) => item.id} // chave única para os itens
          ListEmptyComponent={ // casos de lista vazia
            !loading ? <Text style={styles.empty}>Nenhuma criança cadastrada ainda.</Text> : null
          }
          renderItem={({ item }) => {
            const isActive = activeChild?.id === item.id;
            return (
              <Card style={styles.card} onPress={() => openSettings(item)}>
                <Card.Content style={styles.cardContent}>
                  <IconButton
                    icon={isActive ? 'star' : 'star-outline'}
                    iconColor="#F5A623"
                    size={22}
                    accessibilityLabel={isActive ? `${item.name} usa a jornada` : `Usar a jornada com ${item.name}`}
                    onPress={() => selectChild(item)}
                  />
                  <View style={styles.cardInfo}>
                    <Text style={styles.cardTitle}>{item.name}</Text>
                    <Text style={styles.cardSub}>
                      Volume máximo {Math.round(item.maxVolume * 100)}% · Sessão de {item.sessionMinutes} min
                    </Text>
                  </View>
                  <View style={styles.cardActions}>
                    <IconButton icon="pencil" iconColor="#2E6FB7" size={20} accessibilityLabel={`Renomear ${item.name}`} onPress={() => editChild(item)} />
                    <IconButton icon="trash-can-outline" iconColor="#FF7A7A" size={20} accessibilityLabel={`Excluir ${item.name}`} onPress={() => handleDelete(item.id)} />
                  </View>
                </Card.Content>
              </Card>
            );
          }}
        />
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({ // StyleSheet
  safe: {
    flex: 1, // flexbox
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#2E6FB7',
  },
  headerActions: {
    flexDirection: 'row',
  },
  helper: {
    fontSize: 13,
    color: '#6E8BA8',
    marginTop: 4,
  },
  newButton: {
    borderRadius: 24,
    marginTop: 12,
    marginBottom: 12,
  },
  newButtonContent: {
    height: 48,
  },
  loader: {
    marginVertical: 12,
  },
  list: {
    paddingBottom: 32,
  },
  empty: {
    color: '#6E8BA8',
    textAlign: 'center',
    marginTop: 32,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 10,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 4,
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2E6FB7',
  },
  cardSub: {
    fontSize: 13,
    color: '#8AA0B8',
    marginTop: 2,
  },
  cardActions: {
    flexDirection: 'row',
  },
});
