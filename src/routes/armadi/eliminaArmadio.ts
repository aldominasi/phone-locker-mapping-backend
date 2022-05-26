import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import armadiSchema from '../../entities/armadi/armadi.schema';
import { IQuerystringJwt } from '../../plugins/jwtHandler';
import S from 'fluent-json-schema';
import { ResponseApi } from '../../models/ResponseApi';
import { MSG_ERROR_DEFAULT } from '../../utilities/defaultValue';
import ResponseApiSerialization from "../../schemas/serializations/responseApi.serialization";

enum Errore {
  GENERICO = 'ERR_DEL_ARM_1',
  INFO_UTENTE = 'ERR_DEL_ARM_2',
  PERMESSI = 'ERR_DEL_ARM_3'
}

interface IParams {
  id: string
}

export default async (server: FastifyInstance, options: FastifyPluginOptions) => {
  /*
  REST API per eliminare un armadio
  Codici di errore:
  ERR_DEL_ARM_1 - Errore generico
  ERR_DEL_ARM_2 - Errore nel recupero delle informazioni presenti nel token
  ERR_DEL_ARM_3 - L'utente non ha il permesso di accedere all'API
   */
  server.delete<{
    Querystring: IQuerystringJwt,
    Params: IParams
  }>('/:id', {
    constraints: {
      version: '1.0.0'
    },
    schema: {
      params: S.object().prop('id', S.string().required()),
      response: {
        '200': ResponseApiSerialization.prop('data', S.null()),
        '204': S.null()
      }
    },
    onRequest: [server.verifyAuth, server.verificaPwdScaduta]
  }, async (request, reply) => {
    try {
      const tokenData = await server.getDataFromToken(request.query.token); // Recupera le informazioni presenti nel token
      if (tokenData == null)
        return new ResponseApi(null, false, MSG_ERROR_DEFAULT, Errore.INFO_UTENTE);
      const permesso: boolean = await server.verificaPermessi(tokenData.id, 'writeArmadi'); // Verifica i permessi dell'utente
      if (!permesso)
        return new ResponseApi(null, false, 'Accesso non autorizzato', Errore.PERMESSI);
      await armadiSchema.findByIdAndDelete(request.params.id);
      return await reply.code(204).send();
    } catch (ex) {
      server.log.error(ex);
      return new ResponseApi(null, false, MSG_ERROR_DEFAULT, Errore.GENERICO);
    }
  });
};
