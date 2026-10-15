import type { FastifyInstance } from 'fastify';
import { resetUsers } from '../lib/users.js';

export default async function systemRoutes(app: FastifyInstance) {
    const handleReset = async (_req: any, reply: any) => {
        resetUsers();
        return reply.code(200).send({ message: 'Estado do sistema resetado com sucesso' });
    };

    app.post('/reset', handleReset);
}
