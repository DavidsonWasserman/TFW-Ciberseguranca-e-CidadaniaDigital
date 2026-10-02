import Fastify from 'fastify';
import fastifyStatic from '@fastify/static';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import authRoutes from './routes/authRoute.js';
import twoFactorRoutes from './routes/twofaRoute.js';
import jwt from '@fastify/jwt';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = Fastify({ logger: true });

await app.register(fastifyStatic, {
    root: path.join(__dirname, '../public'),
    prefix: '/',
});

await app.register(jwt, { secret: process.env.JWT_SECRET ?? 'wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww' });

await app.register(authRoutes);
await app.register(twoFactorRoutes);

await app.listen({ port: 3000, host: '0.0.0.0' });