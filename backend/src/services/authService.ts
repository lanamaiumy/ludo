import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AppError } from '../errors/AppError';
import type { Responsavel, ResponsavelRepository } from '../repositories/responsavelRepository';
import type { CadastroInput, LoginInput } from '../validators/authSchemas';

const HASH_ROUNDS = 10;
const TOKEN_EXPIRATION = '7d';
const UNIQUE_VIOLATION = '23505';
const HASH_FOR_UNKNOWN_EMAIL = '$2b$10$hT18GtBoyfbTF0nnmeQB..Geuo7rM47nr4PWOtK4zqR69/9JfzPee';

function toPublic(responsavel: Responsavel) {
  return {
    id: responsavel.id,
    nome: responsavel.nome,
    email: responsavel.email,
    pinCadastrado: responsavel.pin_hash !== null,
    criadoEm: responsavel.criado_em,
  };
}

function isUniqueViolation(error: unknown): boolean {
  return typeof error === 'object' && error !== null && 'code' in error && error.code === UNIQUE_VIOLATION;
}

export function createAuthService(repository: ResponsavelRepository, jwtSecret: string) {
  return {
    async register({ nome, email, senha }: CadastroInput) {
      const senhaHash = await bcrypt.hash(senha, HASH_ROUNDS);

      try {
        const responsavel = await repository.create({ nome, email, senhaHash });
        return toPublic(responsavel);
      } catch (error) {
        if (isUniqueViolation(error)) {
          throw new AppError(409, 'Este e-mail já está cadastrado');
        }
        throw error;
      }
    },

    async login({ email, senha }: LoginInput) {
      const responsavel = await repository.findByEmail(email);
      const passwordMatches = await bcrypt.compare(
        senha,
        responsavel?.senha_hash ?? HASH_FOR_UNKNOWN_EMAIL,
      );

      if (!responsavel || !passwordMatches) {
        throw new AppError(401, 'E-mail ou senha inválidos');
      }

      const token = jwt.sign({}, jwtSecret, {
        subject: responsavel.id,
        expiresIn: TOKEN_EXPIRATION,
        algorithm: 'HS256',
      });

      return { token, responsavel: toPublic(responsavel) };
    },

    async profile(id: string) {
      const responsavel = await repository.findById(id);

      if (!responsavel) {
        throw new AppError(404, 'Responsável não encontrado');
      }

      return toPublic(responsavel);
    },
  };
}

export type AuthService = ReturnType<typeof createAuthService>;
