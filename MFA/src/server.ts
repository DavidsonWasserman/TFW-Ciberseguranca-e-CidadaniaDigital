import Fastify from 'fastify';
import fastifyStatic from '@fastify/static';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import authRoutes from './routes/authRoute.js';
import twoFactorRoutes from './routes/twofaRoute.js';
import systemRoutes from './routes/systemRoute.js';
import jwt from '@fastify/jwt';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = Fastify({ logger: true });

app.addContentTypeParser('application/json', { parseAs: 'string' }, (_req, body, done) => {
    if (!body || (typeof body === 'string' && body.trim().length === 0)) {
        done(null, {});
        return;
    }
    try {
        done(null, JSON.parse(body as string));
    } catch (err: any) {
        err.statusCode = 400;
        done(err, undefined);
    }
});

await app.register(fastifyStatic, {
    root: path.join(__dirname, '../public'),
    prefix: '/',
});

await app.register(jwt, { secret: process.env.JWT_SECRET ?? 'wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww' });

await app.register(authRoutes);
await app.register(twoFactorRoutes);
await app.register(systemRoutes);

await app.listen({ port: 3000, host: '0.0.0.0' });