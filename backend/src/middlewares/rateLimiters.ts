import { rateLimit } from 'express-rate-limit';

const FIFTEEN_MINUTES = 15 * 60 * 1000;

export function limitAttemptsByOrigin() {
  return rateLimit({
    windowMs: FIFTEEN_MINUTES,
    limit: 10,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: { mensagem: 'Muitas tentativas. Aguarde alguns minutos e tente novamente.' },
  });
}

export function limitFailedAttemptsByResponsavel() {
  return rateLimit({
    windowMs: FIFTEEN_MINUTES,
    limit: 5,
    skipSuccessfulRequests: true,
    keyGenerator: (_request, response) => response.locals.responsavelId,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: { mensagem: 'Muitas tentativas incorretas. Aguarde alguns minutos e tente novamente.' },
  });
}
