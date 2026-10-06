import type { ErrorRequestHandler, RequestHandler } from 'express';

export const notFound: RequestHandler = (_request, response) => {
  response.status(404).json({ mensagem: 'Rota não encontrada' });
};

export const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  if (error.expose && error.status < 500) {
    response.status(error.status).json({ mensagem: 'Requisição inválida' });
    return;
  }

  console.error(error);
  response.status(500).json({ mensagem: 'Erro interno do servidor' });
};
