import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import armadiSchema from '../../entities/armadi/armadi.schema';
import { IQuerystringJwt } from '../../plugins/jwtHandler';
import S from 'fluent-json-schema';
import { ResponseApi } from '../../models/ResponseApi';
import { MSG_ERROR_DEFAULT } from '../../utilities/defaultValue';

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

   */
  server.delete<{
    Querystring: IQuerystringJwt,
    Params: IParams
  }>('/:id', {
    constraints: {
      version: '1.0.0'
    },
    schema: {
      params: S.object().prop('id', S.string().required())
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
      const result = await armadiSchema.findByIdAndDelete(request.params.id);
      return new ResponseApi(result);
    } catch (ex) {
      server.log.error(ex);
      return new ResponseApi(null, false, MSG_ERROR_DEFAULT, Errore.GENERICO);
    }
  });
};
