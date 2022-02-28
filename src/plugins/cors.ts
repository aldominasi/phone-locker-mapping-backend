import fp from 'fastify-plugin';
import fastifyCors from 'fastify-cors';
import { FastifyInstance, FastifyPluginAsync } from 'fastify';

const corsAllowed: FastifyPluginAsync = async function (server: FastifyInstance) {
  try {
    server.register(fastifyCors, () => {
      return (req, cb) => {
        let corsOptions = { origin: false };
        const origin: string | undefined = req.headers.origin;
        if (origin == null) {
          return cb(null, corsOptions);
        }
        const hostname = new URL(origin).hostname;
        if (hostname === "localhost")
          corsOptions = {origin: true};
        cb(null, corsOptions);
      };
    });
  } catch (ex) {
    server.log.error(ex);
  }
};

export default fp(corsAllowed);
