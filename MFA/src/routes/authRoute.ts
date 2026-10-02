import type { FastifyInstance } from 'fastify';
import { users, verifyPassword } from '../lib/users.js';
import { check } from '../lib/totp.js';
import { require2faToken } from '../lib/auth.js';

export default async function authRoutes(app: FastifyInstance) {
    app.post<{ Body: { username: string; password: string } }>('/login', async (req, reply) => {
        const { username, password } = req.body ?? {};
        const user = users.get(username);
        if (!user || !verifyPassword(password, user.passwordHash))
            return reply.code(401).send({ error: 'Nome de usuário ou senha inválidos' });

        if (user.totpSecret) {
            const tempToken = app.jwt.sign({ sub: username, purpose: '2fa' }, { expiresIn: '5m' });
            return { twoFactorRequired: true, tempToken };
        }
        return { twoFactorRequired: false, token: app.jwt.sign({ sub: username, purpose: 'full' }, { expiresIn: '1h' }) };
    });

    app.post<{ Body: { code: string } }>('/2fa/verify', { onRequest: require2faToken }, async (req, reply) => {
        const user = users.get(req.user.sub);
        if (!user?.totpSecret) return reply.code(401).send({ error: 'Token temporário inválido ou expirado' });

        if (!(await check(req.body.code, user.totpSecret)))
            return reply.code(401).send({ error: 'Código de verificação inválido' });

        return { token: app.jwt.sign({ sub: user.username, purpose: 'full' }, { expiresIn: '1h' }) };
    }
    );
}