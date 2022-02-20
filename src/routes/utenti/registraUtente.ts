import { FastifyInstance, FastifyPluginOptions, FastifyRequest, FastifyReply } from 'fastify';
import utentiSchema from '../../entities/utenti/utenti.schema';
import IUtenti from '../../entities/utenti/utenti.interface';
import { ResponseApi } from "../../models/ResponseApi";
import { MSG_ERROR_DEFAULT } from '../../utilities/defaultValue';
import { hash } from 'bcryptjs';

export default async (server: FastifyInstance, options: FastifyPluginOptions) => {
  server.post<{
    Body: IUtenti
  }>('/', {
    constraints: {
      version: '1.0.0'
    },
    onRequest: server.verifyAuth
  }, async (request, reply): Promise<ResponseApi> => {
    try {
      request.body.password = await hash(request.body.password, parseInt(process.env.SALT_PWD ?? '8'));
      const utenteCreato = await utentiSchema.create(request.body);
      return new ResponseApi(utenteCreato);
    } catch (ex) {
      server.log.error(ex);
      return new ResponseApi(null, false, MSG_ERROR_DEFAULT, 3);
    }
  });
};
