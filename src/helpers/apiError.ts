import { isAxiosError } from 'axios';

type ApiErrorBody = {
  mensagem?: string;
  erros?: Record<string, string[] | undefined>;
};

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (!isAxiosError<ApiErrorBody>(error)) {
    return fallback;
  }
  if (!error.response) {
    return 'Não foi possível conectar ao servidor. Verifique a conexão.';
  }

  const { mensagem, erros } = error.response.data ?? {};
  const firstFieldError = erros ? Object.values(erros).flat().find(Boolean) : undefined;

  return firstFieldError ?? mensagem ?? fallback;
}

export function getApiErrorStatus(error: unknown): number | null {
  return isAxiosError(error) && error.response ? error.response.status : null;
}
