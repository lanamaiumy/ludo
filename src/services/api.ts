import axios from 'axios';
import { AsyncStorageHelper } from '../helpers/AsyncStorageHelper';

const TOKEN_KEY = 'auth_token';

const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorageHelper.getString(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = token;
  }
  return config;
});

export default api;
