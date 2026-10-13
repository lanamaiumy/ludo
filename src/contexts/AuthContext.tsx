import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '../types/User';
import { AsyncStorageHelper } from '../helpers/AsyncStorageHelper';
import { getApiErrorStatus } from '../helpers/apiError';
import api from '../services/api';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

type AuthContextData = { // conjunto que o contexto irá entregar ao provider
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isParentAreaUnlocked: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  markPinCreated: () => Promise<void>;
  unlockParentArea: () => void;
  lockParentArea: () => void;
};

type AuthRecord = { // tipo usuário que vem da api (pocketbase), serve para tipar a resposta do login
  id: string;
  nome: string;
  email: string;
  pinCadastrado: boolean;
};

const AuthContext = createContext<AuthContextData>({ // criamos o contexto (valor que será enviado posteriormente para (parents)/settings.tsx, por exemplo)
  user: null,
  token: null,
  isLoading: true,
  isParentAreaUnlocked: false,
  login: async () => {
    throw new Error('AuthContextProvider ausente');
  },
  logout: async () => {},
  markPinCreated: async () => {},
  unlockParentArea: () => {},
  lockParentArea: () => {},
});

function mapRecord(record: AuthRecord): User { // renomeamos o que vem da api para camelCase (convensão), e também, se não tiver determinado dado, use 'Ana', '10' e etc
  return {
    id: record.id,
    name: record.nome,
    email: record.email,
    hasPin: record.pinCadastrado,
  };
}

export function AuthContextProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null); // guardamos o user
  const [token, setToken] = useState<string | null>(null);  // guardamos o token
  const [isLoading, setIsLoading] = useState(true);
  const [isParentAreaUnlocked, setIsParentAreaUnlocked] = useState(false);

  useEffect(() => {
    async function loadStored() {
      try {
        const storedToken = await AsyncStorageHelper.getString(TOKEN_KEY);
        const storedUser = await AsyncStorageHelper.getObject<User>(USER_KEY);
        if (storedToken && storedUser?.name) { // se tivermos alguma coisa no token, setToken()
          setToken(storedToken);
          setUser(storedUser); // se tivermos alguma coisa no user, setUser()
        }
      } finally {
        setIsLoading(false);
      }
    }
    loadStored(); //lê o disco atual
  }, []);

  async function login(email: string, password: string): Promise<User> { //login faz post com email e senha do usuário
    const response = await api.post('/auth/login', {
      email,
      senha: password,
    });
    const newToken: string = response.data.token; // token que a api devolveu
    const mappedUser = mapRecord(response.data.responsavel); // record que a api devolveu com mapRecord
    // salvamos no disco as informações
    await AsyncStorageHelper.setString(TOKEN_KEY, newToken);
    await AsyncStorageHelper.setObject<User>(USER_KEY, mappedUser);
    // atualizamos o estado/memória
    setToken(newToken);
    setUser(mappedUser);
    return mappedUser;
  }

  const logout = useCallback(async (): Promise<void> => {
    await AsyncStorageHelper.remove(TOKEN_KEY);
    await AsyncStorageHelper.remove(USER_KEY);
    // dados nulos para logout
    setToken(null);
    setUser(null);
    setIsParentAreaUnlocked(false);
  }, []);

  useEffect(() => {
    const interceptor = api.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (token && getApiErrorStatus(error) === 401) {
          await logout();
        }
        return Promise.reject(error);
      },
    );
    return () => api.interceptors.response.eject(interceptor);
  }, [token, logout]);

  async function markPinCreated(): Promise<void> {
    if (!user) {
      return;
    }
    const updatedUser = { ...user, hasPin: true };
    await AsyncStorageHelper.setObject<User>(USER_KEY, updatedUser);
    setUser(updatedUser);
  }

  const unlockParentArea = useCallback(() => setIsParentAreaUnlocked(true), []);
  const lockParentArea = useCallback(() => setIsParentAreaUnlocked(false), []);

  // retornamos os valores ao provider
  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isParentAreaUnlocked,
        login,
        logout,
        markPinCreated,
        unlockParentArea,
        lockParentArea,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextData { // hook das telas
  return useContext(AuthContext);
}
