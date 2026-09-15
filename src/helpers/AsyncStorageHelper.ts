import AsyncStorage from '@react-native-async-storage/async-storage';

async function setString(key: string, value: string): Promise<void> {
  try {
    await AsyncStorage.setItem(key, value);
  } catch (error) {
    throw new Error('Não foi possível salvar o dado: ' + key);
  }
}

async function getString(key: string): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(key);
  } catch (error) {
    return null;
  }
}

async function setNumber(key: string, value: number): Promise<void> {
  await setString(key, String(value));
}

async function getNumber(key: string): Promise<number | null> {
  const value = await getString(key);
  if (value === null) {
    return null;
  }
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
}

async function setBoolean(key: string, value: boolean): Promise<void> {
  await setString(key, value ? 'true' : 'false');
}

async function getBoolean(key: string): Promise<boolean | null> {
  const value = await getString(key);
  if (value === null) {
    return null;
  }
  return value === 'true';
}

async function setObject<T>(key: string, value: T): Promise<void> {
  await setString(key, JSON.stringify(value));
}

async function getObject<T>(key: string): Promise<T | null> {
  const value = await getString(key);
  if (value === null) {
    return null;
  }
  try {
    return JSON.parse(value) as T;
  } catch (error) {
    return null;
  }
}

async function remove(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    throw new Error('Não foi possível remover o dado: ' + key);
  }
}

export const AsyncStorageHelper = {
  setString,
  getString,
  setNumber,
  getNumber,
  setBoolean,
  getBoolean,
  setObject,
  getObject,
  remove,
};
