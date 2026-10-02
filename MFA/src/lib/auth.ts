import '@fastify/jwt';
import type { FastifyReply, FastifyRequest } from 'fastify';

export type Purpose = 'full' | '2fa'; // "2fa" = login parcial, falta o código

declare module '@fastify/jwt' {
    interface FastifyJWT {
        payload: { sub: string; purpose: Purpose };
        user: { sub: string; purpose: Purpose };
    }
}

export async function requireAuth(req: FastifyRequest, reply: FastifyReply) {
    try {
        await req.jwtVerify();
        if (req.user.purpose !== 'full') throw new Error();
    } catch {
        return reply.code(401).send({ error: 'Não autenticado' });
    }
}