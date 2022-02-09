import { fastify } from 'fastify';
import fastifyAutoload from 'fastify-autoload';
import path from 'path';
const PORT: number | string = process.env.PORT_PLM_BACKEND ?? 3000; //TODO: INSERIRE LA VARIABILE D'AMBIENTE PER SETTARE LA PORTA DEL BACKEND

const server = fastify({
  logger: true
});

const start = async (): Promise<void> => {
  try {
    await server.register(fastifyAutoload, {
      dir: path.join(__dirname, 'plugins')
    });
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
