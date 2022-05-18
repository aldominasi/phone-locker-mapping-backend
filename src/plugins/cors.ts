import fp from 'fastify-plugin';
import fastifyCors from 'fastify-cors';
import { FastifyInstance, FastifyPluginAsync } from 'fastify';

const originAllowed = [ 'phone-locker-mapping-pwa.vercel.app', '127.0.0.1', 'localhost' ];

const corsAllowed: FastifyPluginAsync = async function (server: FastifyInstance) {
  try {
    server.register(fastifyCors, () => {
      return (req, cb) => {
        if (process.env.DEVELOPMENT != null) {
          cb(null, { origin: true });
        }
        else {
          const origin: string | undefined = req.headers.origin;
          if (origin != null) {
            const hostname = new URL(origin).hostname;
            if (originAllowed.includes(hostname))
              return cb(null, { origin: true });
          }
          cb(new Error('Accesso non consentito'));
        }
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
