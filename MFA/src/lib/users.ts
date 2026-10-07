import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

export interface User {
    username: string;
    passwordHash: string;
    totpSecret?: string;
    pendingSecret?: string;
}

export function hashPassword(password: string): string {
    const salt = randomBytes(16).toString('hex');
    return `${salt}:${scryptSync(password, salt, 64).toString('hex')}`;
}

export function verifyPassword(password: string, stored: string): boolean {
    const [salt, hash] = stored.split(':');
    if (!salt || !hash) return false;

    const expected = Buffer.from(hash, 'hex');
    const candidate = scryptSync(password, salt, expected.length);
    return timingSafeEqual(candidate, expected);
}

export const users = new Map<string, User>();

/* Usuário de demonstração: alunorural / senha123 */
users.set('alunorural', { username: 'alunorural', passwordHash: hashPassword('senha123') });