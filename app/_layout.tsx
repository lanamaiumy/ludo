import { DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { Appearance } from 'react-native'; // fonte importada
import {
  useFonts,
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
} from '@expo-google-fonts/plus-jakarta-sans';
import { configureFonts, MD3LightTheme, PaperProvider } from 'react-native-paper'; // tema
import { SafeAreaProvider } from 'react-native-safe-area-context'; // medidas seguras dos aparelhos
import { AuthContextProvider } from '../src/contexts/AuthContext'; // estado de acesso dos pais
import { ProgressContextProvider } from '../src/contexts/ProgressContext'; // progresso da criança

// precisamos obrigatoriamente do _layout, são as regras de layout que 
// vamos ter para qualquer página criada a partir do /app

if (typeof Appearance.setColorScheme === 'function') {
  Appearance.setColorScheme('light');
}

const fonts = configureFonts({ config: { fontFamily: 'PlusJakartaSans_400Regular' } });

const theme = {
  ...MD3LightTheme,
  fonts,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#4A90D9',
    secondary: '#F5A623',
  },
};

const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#EAF4FF',
    card: '#EAF4FF',
  },
};

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <ThemeProvider value={navigationTheme}>
          <AuthContextProvider>
            <ProgressContextProvider>
              <Stack // definimos se vamos empilhar uma tela por cima de outra com o stack
                screenOptions={{
                  headerShown: false, // definimos se teremos a barra de navegação ou não
                  contentStyle: { backgroundColor: '#EAF4FF' },
                }}
              />
            </ProgressContextProvider>
          </AuthContextProvider>
        </ThemeProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
