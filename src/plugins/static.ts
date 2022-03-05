import { FastifyInstance, FastifyPluginOptions } from "fastify";
import fastifyStatic from 'fastify-static';
import fp from 'fastify-plugin';
import path from 'path';

export default fp(async (server: FastifyInstance, options: FastifyPluginOptions): Promise<void> => {
  // Public resources
  await server.register(fastifyStatic, {
    root: path.resolve(__dirname, '..', 'public', 'dist'),
    prefix: '/plm/'
  });
});
