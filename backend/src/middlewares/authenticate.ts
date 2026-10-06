import type { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from '../errors/AppError';

export function authenticate(jwtSecret: string): RequestHandler {
  return (request, response, next) => {
    const [scheme, token] = request.headers.authorization?.split(' ') ?? [];

    if (scheme !== 'Bearer' || !token) {
      throw new AppError(401, 'Token de acesso não informado');
    }

    let payload: jwt.JwtPayload | string;
    try {
      payload = jwt.verify(token, jwtSecret, { algorithms: ['HS256'] });
    } catch {
      throw new AppError(401, 'Token de acesso inválido ou expirado');
    }

    if (typeof payload === 'string' || !payload.sub) {
      throw new AppError(401, 'Token de acesso inválido ou expirado');
    }

    response.locals.responsavelId = payload.sub;
    next();
  };
}
