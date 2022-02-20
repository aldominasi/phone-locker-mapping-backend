import { FastifyInstance, FastifyPluginOptions, FastifyRequest, FastifyReply } from 'fastify';
import utentiSchema from '../../entities/utenti/utenti.schema';
import IUtenti from '../../entities/utenti/utenti.interface';
import { MSG_ERROR_DEFAULT } from '../../utilities/defaultValue';
import { ResponseApi } from "../../models/ResponseApi";

export default async (server: FastifyInstance, options: FastifyPluginOptions) => {
  /*
  REST API per recuperare le info dell'utente
  1 - Errore generico
   */
  server.get('/me', {
    constraints: {
      version: '1.0.0'
    },
    preHandler: server.verifyAuth
  }, async (request: FastifyRequest, reply: FastifyReply): Promise<ResponseApi> => {
    try {
      const tokenData = server.getDataFromToken(request);
      if (tokenData == null)
        return new ResponseApi(null, false, MSG_ERROR_DEFAULT, 2);
      const utente: null | IUtenti = await utentiSchema.findById(tokenData.id, {_id: 0, password: 0}).exec();
      if (utente == null)
        return new ResponseApi(null, false, MSG_ERROR_DEFAULT, 3);
      return new ResponseApi(utente);
    } catch (ex) {
      server.log.error(ex);
      return new ResponseApi(null, false, MSG_ERROR_DEFAULT, 1);
    }
  });
};
