import { useCallback } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';

export function useParentAccess(): boolean {
  const router = useRouter();
  const { token, isLoading, isParentAreaUnlocked } = useAuth();

  useFocusEffect(
    useCallback(() => {
      if (isLoading) {
        return;
      }
      if (!token) {
        router.replace('/(parent)/login');
      } else if (!isParentAreaUnlocked) {
        router.replace('/(parent)/pin');
      }
    }, [isLoading, token, isParentAreaUnlocked, router])
  );

  return !isLoading && Boolean(token) && isParentAreaUnlocked;
}
