import type { FastifyInstance } from 'fastify';
import { users, verifyPassword } from '../lib/users.js';

export default async function authRoutes(app: FastifyInstance) {
    app.post<{ Body: { username: string; password: string } }>('/login', async (req, reply) => {
        const { username, password } = req.body ?? {};
        const user = users.get(username);
        if (!user || !verifyPassword(password, user.passwordHash))
            return reply.code(401).send({ error: 'Credenciais inválidas' });

        return { token: app.jwt.sign({ sub: username, purpose: 'full' }, { expiresIn: '1h' }) };
    });
}