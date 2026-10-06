import bcrypt from 'bcryptjs';

const HASH_ROUNDS = 10;

export function hashSecret(value: string): Promise<string> {
  return bcrypt.hash(value, HASH_ROUNDS);
}

export function compareSecret(value: string, hash: string): Promise<boolean> {
  return bcrypt.compare(value, hash);
}
