import type { FastifyInstance } from 'fastify';
import QRCode from 'qrcode';
import { requireAuth } from '../lib/auth.js';
import { check, generateSecret, keyuri } from '../lib/totp.js';
import { users } from '../lib/users.js';

export default async function twoFactorRoutes(app: FastifyInstance) {
    app.addHook('preHandler', requireAuth);

    app.post('/2fa/setup', async (req, reply) => {
        const user = users.get(req.user.sub)!;
        if (user.totpSecret) return reply.code(400).send({ error: '2FA já está ativo' });

        user.pendingSecret = generateSecret();
        const otpauthUrl = keyuri(user.username, user.pendingSecret);

        return { secret: user.pendingSecret, otpauthUrl, qrCode: await QRCode.toDataURL(otpauthUrl) };
    });

    app.post<{ Body: { code: string } }>('/2fa/enable', async (req, reply) => {
        const user = users.get(req.user.sub)!;
        if (!user.pendingSecret) return reply.code(400).send({ error: 'É necessário executar o setup primeiro' });
        if (!(await check(req.body.code, user.pendingSecret)))
            return reply.code(401).send({ error: 'Código inválido' });

        user.totpSecret = user.pendingSecret;
        user.pendingSecret = undefined;
        return { message: '2FA ativado com sucesso' };
    });

    app.post<{ Body: { code: string } }>('/2fa/disable', async (req, reply) => {
        const user = users.get(req.user.sub)!;
        if (!user.totpSecret || !(await check(req.body.code, user.totpSecret)))
            return reply.code(401).send({ error: 'Código de verificação inválido' });

        user.totpSecret = undefined;
        return { message: '2FA desativado' };
    });
}