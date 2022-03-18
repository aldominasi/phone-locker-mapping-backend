import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import fp from 'fastify-plugin';

const alpha = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
const integers = '0123456789';
const exCharacters = '!@#$*_=+';

export default fp(async (server: FastifyInstance, options: FastifyPluginOptions) => {
  server.decorate('createPwd', (length: number, hasNumbers: boolean, hasSymbols: boolean): string => {
    let chars = alpha;
    if (hasNumbers)
      chars += integers;
    if (hasSymbols)
      chars += exCharacters;
    return generatePassword(length, chars);
  });
});

const generatePassword = (length: number, chars: string) => {
  let pwd = '';
  for (let i = 0; i < length; i++)
    pwd += chars.charAt(Math.floor(Math.random() * chars.length));
  return pwd;
};

declare module 'fastify' {
  export interface FastifyInstance {
    createPwd: (length: number, hasNumbers: boolean, hasSymbols: boolean) => string;
  }
}
