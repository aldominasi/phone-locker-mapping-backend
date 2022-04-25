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
        else if (hostname === getHostNameFromRegex(process.env.HOST_PLM as string))
          corsOptions = { origin: true };
        cb(null, corsOptions);
      };
    });
  } catch (ex) {
    server.log.error(ex);
  }
};

function getHostNameFromRegex(url: string) {
  const matches = url.match(/^https?:\/\/([^/?#]+)(?:[/?#]|$)/i);
  return matches && matches[1];
}

export default fp(corsAllowed);
