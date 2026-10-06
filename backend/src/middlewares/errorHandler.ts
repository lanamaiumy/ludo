import type { ErrorRequestHandler, RequestHandler } from 'express';
import { ZodError, z } from 'zod';
import { AppError } from '../errors/AppError';

export const notFound: RequestHandler = (_request, response) => {
  response.status(404).json({ mensagem: 'Rota não encontrada' });
};

export const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  if (error instanceof AppError) {
    response.status(error.status).json({ mensagem: error.message });
    return;
  }

  if (error instanceof ZodError) {
    response.status(400).json({
      mensagem: 'Dados inválidos',
      erros: z.flattenError(error).fieldErrors,
    });
    return;
  }

  if (error.expose && error.status < 500) {
    response.status(error.status).json({ mensagem: 'Requisição inválida' });
    return;
  }

  console.error(error);
  response.status(500).json({ mensagem: 'Erro interno do servidor' });
};
