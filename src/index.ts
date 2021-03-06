import { fastify } from 'fastify';
import fastifyAutoload from 'fastify-autoload';
import path from 'path';
import Env from 'fastify-env';
import envValidation from './schemas/validations/env.validation';
import utentiSchema from './entities/utenti/utenti.schema';
import { hash } from 'bcryptjs';

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
        schema: envValidation,
        dotenv: { path: './.env' }
      });
    const PORT: number | string = process.env.PORT_PLM_BACKEND ?? 3000;
    await server.register(fastifyAutoload, {
      dir: path.join(__dirname, 'plugins')
    });
    await server.register(fastifyAutoload, {
      dir: path.join(__dirname, 'routes'),
      dirNameRoutePrefix: true
    });
    const utenteAdmin = await utentiSchema.findOne({ email: 'admin@admin.com' }).exec();
    if (utenteAdmin == null)
      await utentiSchema.create({
        "email": "admin@admin.com",
        "password": await hash('Cambiami1', parseInt(process.env.SALT_PWD ?? '8')),
        "numeroCellulare": "333098273645",
        "nome": "admin",
        "cognome": "admin",
        "ruolo": "ADMIN"
      });
    await server.listen(PORT, '0.0.0.0');
  } catch (ex) {
    server.log.error(ex);
    process.exit(1);
  }
};

void start();
