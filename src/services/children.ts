import api from './api';
import { Child, SessionMinutes } from '../types/Child';

type ApiChild = {
  id: string;
  nome: string;
  configuracao: {
    volumeMaximo: number;
    tempoSessaoMinutos: SessionMinutes;
  };
};

type ChildSettings = Pick<Child, 'maxVolume' | 'sessionMinutes'>;

export function toChild(data: ApiChild): Child {
  return {
    id: data.id,
    name: data.nome,
    maxVolume: data.configuracao.volumeMaximo / 100,
    sessionMinutes: data.configuracao.tempoSessaoMinutos,
  };
}

export function toApiVolume(volume: number): number {
  return Math.min(100, Math.max(1, Math.round(volume * 100)));
}

export async function listChildren(): Promise<Child[]> {
  const response = await api.get<ApiChild[]>('/criancas');
  return response.data.map(toChild);
}

export async function getChild(id: string): Promise<Child> {
  const response = await api.get<ApiChild>(`/criancas/${id}`);
  return toChild(response.data);
}

export async function createChild(name: string): Promise<Child> {
  const response = await api.post<ApiChild>('/criancas', { nome: name });
  return toChild(response.data);
}

export async function renameChild(id: string, name: string): Promise<Child> {
  const response = await api.patch<ApiChild>(`/criancas/${id}`, { nome: name });
  return toChild(response.data);
}

export async function deleteChild(id: string): Promise<void> {
  await api.delete(`/criancas/${id}`);
}

export async function saveChildSettings(id: string, { maxVolume, sessionMinutes }: ChildSettings): Promise<Child> {
  const response = await api.put<ApiChild>(`/criancas/${id}/configuracao`, {
    volumeMaximo: toApiVolume(maxVolume),
    tempoSessaoMinutos: sessionMinutes,
  });
  return toChild(response.data);
}

export async function restoreDefaultSettings(id: string): Promise<Child> {
  const response = await api.put<ApiChild>(`/criancas/${id}/configuracao/padrao`);
  return toChild(response.data);
}
