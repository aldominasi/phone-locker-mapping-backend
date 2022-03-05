import fp from 'fastify-plugin';
import fastifyCors, { FastifyCorsOptions } from 'fastify-cors';
import { FastifyInstance, FastifyPluginAsync } from 'fastify';

const corsAllowed: FastifyPluginAsync = async function (server: FastifyInstance) {
  try {
    server.register(fastifyCors, () => {
      return (req, cb) => {
        let corsOptions: FastifyCorsOptions = { origin: false, credentials: false };
        const origin: string | undefined = req.headers.origin;
        if (origin == null) {
          return cb(null, corsOptions);
        }
        const hostname = new URL(origin).hostname;
        if (process.env.DEVELOPMENT != null)
          corsOptions = { origin: true };
        else if (hostname === "localhost")
          corsOptions = { origin: true };
        cb(null, corsOptions);
      };
    });
  } catch (ex) {
    server.log.error(ex);
  }
};

export default fp(corsAllowed);
