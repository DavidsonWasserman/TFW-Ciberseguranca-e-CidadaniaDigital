import { generateSecret, generateURI, verify } from 'otplib';

export const ISSUER = 'TFW - Grupo 2';

export { generateSecret };

export const keyuri = (label: string, secret: string) =>
    generateURI({ issuer: ISSUER, label, secret });

export async function check(token: string, secret: string): Promise<boolean> {
    const result = await verify({ secret, token, epochTolerance: 30 });
    return result.valid;
}