import { fastify } from 'fastify';
import fastifyAutoload from 'fastify-autoload';
import path from 'path';
import basicAuth from './utilities/basicAuth';
import Env from 'fastify-env';
import envValidation from './schemas/validations/env.validation';

const server = fastify({
  logger: true
});

const start = async (): Promise<void> => {
  try {
    if (process.env.DEVELOPMENT)
      await server.register(Env, {
        dotenv: {
          path: path.resolve(__dirname, '../.env')
        },
        schema: envValidation
      });
    else
      await server.register(Env, {
        schema: envValidation
      });
    const PORT: number | string = process.env.PORT_PLM_BACKEND ?? 3000;
    await server.register(fastifyAutoload, {
      dir: path.join(__dirname, 'plugins')
    });
    await server.register(import('fastify-basic-auth'), basicAuth);
    await server.register(fastifyAutoload, {
      dir: path.join(__dirname, 'routes'),
      dirNameRoutePrefix: true
    });
    await server.listen(PORT, '0.0.0.0');
  } catch (ex) {
    server.log.error(ex);
    process.exit(1);
  }
};

void start();
