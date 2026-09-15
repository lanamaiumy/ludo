import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '../types/User';
import { AsyncStorageHelper } from '../helpers/AsyncStorageHelper';
import api from '../services/api';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

type AuthContextData = { // conjunto que o contexto irá entregar ao provider
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

type AuthRecord = { // tipo usuário que vem da api (pocketbase), serve para tipar a resposta do login 
  id: string;
  email: string;
  child_name?: string;
  max_volume?: number;
  session_time?: number;
};

const AuthContext = createContext<AuthContextData>({ // criamos o contexto (valor que será enviado posteriormente para (parents)/settings.tsx, por exemplo)
  user: null,
  token: null,
  isLoading: true,
  login: async () => {},
  logout: async () => {},
});

function mapRecord(record: AuthRecord): User { // renomeamos o que vem da api para camelCase (convensão), e também, se não tiver determinado dado, use 'Ana', '10' e etc
  return {
    id: record.id,
    email: record.email,
    childName: record.child_name ?? 'Ana',
    maxVolume: record.max_volume ?? 1,
    sessionTime: record.session_time ?? 10,
  };
}

export function AuthContextProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null); // guardamos o user
  const [token, setToken] = useState<string | null>(null);  // guardamos o token 
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadStored() {
      try {
        const storedToken = await AsyncStorageHelper.getString(TOKEN_KEY);
        const storedUser = await AsyncStorageHelper.getObject<User>(USER_KEY);
        if (storedToken) { // se tivermos alguma coisa no token, setToken()
          setToken(storedToken);
        }
        if (storedUser) {
          setUser(storedUser); // se tivermos alguma coisa no user, setUser()
        }
      } finally {
        setIsLoading(false);
      }
    }
    loadStored(); //lê o disco atual
  }, []);

  async function login(email: string, password: string): Promise<void> { //login faz post com email e senha do usuário
    const response = await api.post('/api/collections/users/auth-with-password', {
      identity: email,
      password,
    });
    const newToken: string = response.data.token; // token que a api devolveu 
    const mappedUser = mapRecord(response.data.record); // record que a api devolveu com mapRecord
    // salvamos no disco as informações
    await AsyncStorageHelper.setString(TOKEN_KEY, newToken); 
    await AsyncStorageHelper.setObject<User>(USER_KEY, mappedUser); 
    // atualizamos o estado/memória
    setToken(newToken);
    setUser(mappedUser);
  }

  async function logout(): Promise<void> {
    await AsyncStorageHelper.remove(TOKEN_KEY);
    await AsyncStorageHelper.remove(USER_KEY);
    // dados nulos para logout
    setToken(null);
    setUser(null);
  }

  // retornamos os valores ao provider
  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout }}> 
      {children}  
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextData { // hook das telas
  return useContext(AuthContext);
}
