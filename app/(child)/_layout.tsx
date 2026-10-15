import { useEffect } from 'react';
import { Stack, usePathname, useRouter } from 'expo-router';
import { useSession } from '../../src/contexts/SessionContext';

export default function ChildLayout() {
  const router = useRouter();
  const pathname = usePathname();
  const { isTimeUp } = useSession();

  useEffect(() => {
    if (isTimeUp && pathname !== '/session-end') {
      router.replace('/(child)/session-end');
    }
  }, [isTimeUp, pathname, router]);

  return <Stack screenOptions={{ headerShown: false }} />;
}

// aqui, o _layout não sobrescreve o _layout do app, apenas adiciona 
// novas regras para o _layout das página de (child) por exemplo
