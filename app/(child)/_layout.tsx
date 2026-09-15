import { Stack } from 'expo-router';

export default function ChildLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}

// aqui, o _layout não sobrescreve o _layout do app, apenas adiciona 
// novas regras para o _layout das página de (child) por exemplo

