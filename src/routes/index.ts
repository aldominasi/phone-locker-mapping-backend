import { FastifyInstance, FastifyPluginOptions, FastifyRequest, FastifyReply } from 'fastify';

export default async (server: FastifyInstance, options: FastifyPluginOptions) => {
  server.get('/', async (request: FastifyRequest, reply: FastifyReply): Promise<string> => {
    return 'Sono online';
  });
};
