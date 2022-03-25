import { FastifyInstance, FastifyPluginOptions, FastifyRequest, FastifyReply } from 'fastify';
import IArmadi from '../../entities/armadi/armadi.interface';
import armadiSchema from '../../entities/armadi/armadi.schema';
import { IQuerystringJwt } from '../../plugins/jwtHandler';
import { ResponseApi } from '../../models/ResponseApi';
import { MSG_ERROR_DEFAULT } from '../../utilities/defaultValue';
import { queryVal, bodyVal } from '../../schemas/validations/registraArmadio.validation';
import serializeReply from '../../schemas/serializations/registraArmadio.serialization';

enum Errore {
  GENERICO = 'ERR_ARM_1',
  INFO_UTENTE = 'ERR_ARM_2',
  PERMESSI = 'ERR_ARM_3'
}

export default async (server: FastifyInstance, options: FastifyPluginOptions) => {
  /*
  REST API per registrare un nuovo armadio
  Codici di errore:
  ERR_ARM_1 - Errore generico
  ERR_ARM_2 - Errore nel recupero delle informazioni presenti nel token
  ERR_ARM_3 - L'utente non ha il permesso di accedere all'API
   */
  server.post<{
    Querystring: IQuerystringJwt,
    Body: IArmadi
  }>('/', {
    constraints: {
      version: '1.0.0'
    },
    schema: {
      querystring: queryVal,
      body: bodyVal,
      response: {
        '201': serializeReply
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
        return new ResponseApi(null, false, 'Accesso non autorizzato', Errore.PERMESSI); // L'utente non ha i permessi per accedere all'API
      const result = await armadiSchema.create(request.body); // Registra nel db i dati del nuovo armadio presenti nel payload della richiesta
      return reply.code(201).send(new ResponseApi(result));
    } catch (ex) {
      server.log.error(ex);
      return new ResponseApi(null, false, MSG_ERROR_DEFAULT, Errore.GENERICO);
    }
  });
};
