import { fastify, FastifyRequest, FastifyReply } from 'fastify';
const PORT: number | string = process.env.PORT ?? 3000;

const server = fastify({
    logger: true
});

const start = async (): Promise<void> => {
    try {
        // Test index
        server.get('/', async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
            return reply.code(200).send("Hello World");
        });
        await server.listen(PORT, '0.0.0.0');
    } catch (ex) {
      server.log.error(ex);
      process.exit(1);
    }
}

void start();