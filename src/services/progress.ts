import api from './api';
import { EMPTY_PROGRESS, TrailProgress } from '../helpers/trail';

type ApiProgress = {
  cenario: string;
  desbloqueado: boolean;
  concluido: boolean;
};

export async function getProgress(childId: string): Promise<TrailProgress> {
  const response = await api.get<ApiProgress[]>(`/criancas/${childId}/progresso`);
  return {
    unlocked: response.data.filter((item) => item.desbloqueado).map((item) => item.cenario),
    completed: response.data.filter((item) => item.concluido).map((item) => item.cenario),
  };
}

export async function sendProgress(
  childId: string,
  progress: TrailProgress,
  alreadySaved: TrailProgress = EMPTY_PROGRESS,
): Promise<void> {
  const toComplete = progress.completed.filter((id) => !alreadySaved.completed.includes(id));
  const toUnlock = progress.unlocked.filter(
    (id) => !alreadySaved.unlocked.includes(id) && !progress.completed.includes(id),
  );

  for (const id of toComplete) {
    await api.post(`/criancas/${childId}/progresso/${id}/conclusao`);
  }
  for (const id of toUnlock) {
    await api.post(`/criancas/${childId}/progresso/${id}/desbloqueio`);
  }
}
