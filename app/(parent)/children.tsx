import { useCallback, useEffect, useState } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import { FlatList, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Card, IconButton, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import GradientBackground from '../../components/GradientBackground';
import { useAuth } from '../../src/contexts/AuthContext';
import api from '../../src/services/api';
import { notify } from '../../src/helpers/notify';

type ChildRecord = {
  id: string;
  name: string;
  age: number;
  notes: string;
};

export default function ChildrenScreen() {
  const router = useRouter();
  const { user, token, isLoading: authLoading, logout } = useAuth();
  const [children, setChildren] = useState<ChildRecord[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && !token) {
      router.replace('/(parent)/login');
    }
  }, [authLoading, token, router]);

  // padrão para chamada api: await api.verbo(url, corpo/parametros) 

  const loadChildren = useCallback(async () => { //get
    if (!user) {
      return;
    }
    setLoading(true);
    try {
      const response = await api.get('/api/collections/children/records', { //get
        params: { filter: `(user='${user.id}')`, sort: '-created' },
      });
      setChildren(response.data.items ?? []);
    } catch (e) {
      notify('Não foi possível carregar as crianças. Verifique a conexão.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      loadChildren();
    }, [loadChildren])
  );

  async function handleDelete(id: string) {
    try {
      await api.delete(`/api/collections/children/records/${id}`); //delete
      setChildren((prev) => prev.filter((item) => item.id !== id));
    } catch (e) {
      notify('Não foi possível excluir a criança.');
    }
  }

  async function handleLogout() {
    await logout();
    router.replace('/');
  }

  function editChild(item: ChildRecord) {
    router.push({
      pathname: '/(parent)/child-form',
      params: {
        id: item.id,
        name: item.name,
        age: String(item.age),
        notes: item.notes,
      },
    });
  }

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Text style={styles.title}>Crianças</Text>
          <View style={styles.headerActions}>
            <IconButton icon="cog" iconColor="#2E6FB7" onPress={() => router.push('/(parent)/settings')} />
            <IconButton icon="logout" iconColor="#FF7A7A" onPress={handleLogout} />
          </View>
        </View>

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
          renderItem={({ item }) => (
            <Card style={styles.card}>
              <Card.Content style={styles.cardContent}>
                <View style={styles.cardInfo}>
                  <Text style={styles.cardTitle}>{item.name}</Text>
                  <Text style={styles.cardSub}>
                    {item.age > 0 ? `${item.age} anos` : 'Idade não informada'}
                    {item.notes ? ` · ${item.notes}` : ''}
                  </Text>
                </View>
                <View style={styles.cardActions}>
                  <IconButton icon="pencil" iconColor="#2E6FB7" size={20} onPress={() => editChild(item)} />
                  <IconButton icon="trash-can-outline" iconColor="#FF7A7A" size={20} onPress={() => handleDelete(item.id)} />
                </View>
              </Card.Content>
            </Card>
          )}
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
  newButton: {
    borderRadius: 24,
    marginTop: 8,
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
