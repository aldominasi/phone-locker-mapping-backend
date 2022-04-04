import { FastifyInstance, FastifyPluginOptions, FastifyRequest, FastifyReply } from 'fastify';
import armadiSchema from '../../entities/armadi/armadi.schema';
import comuniSchema from '../../entities/comuni/comuni.schema';
import { IQuerystringJwt } from '../../plugins/jwtHandler';
import { ResponseApi } from '../../models/ResponseApi';
import { MSG_ERROR_DEFAULT } from '../../utilities/defaultValue';
import { queryVal, bodyVal } from '../../schemas/validations/registraArmadio.validation';
import serializeReply from '../../schemas/serializations/registraArmadio.serialization';

enum Errore {
  GENERICO = 'ERR_ARM_1',
  INFO_UTENTE = 'ERR_ARM_2',
  PERMESSI = 'ERR_ARM_3',
  COMUNE_NON_TROVATO = 'ERR_ARM_4',
}

interface IBody {
  centrale: {
    codice: string;
    nome: string;
  };
  progressivo: number;
  zona: {
    info1: string;
    info: string;
  };
  tipoArmadio: string;
  indirizzo: string;
  localizzazione: {
    type: string;
    coordinates: string;
  };
  nota: string;
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
    Body: IBody
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
      const comune = await comuniSchema.findOne({ codice: request.body.centrale.codice }).exec();
      if (comune == null)
        return new ResponseApi(null, false, 'La richiesta non può essere elaborata', Errore.COMUNE_NON_TROVATO);
      const result = await armadiSchema.create({
        ...request.body,
        centrale: comune.nome,
        codiceCentrale: comune.codice,
        provincia: comune.provincia.nome,
        codiceProvincia: comune.provincia.codice
      }); // Registra nel db i dati del nuovo armadio presenti nel payload della richiesta
      return reply.code(201).send(new ResponseApi(result));
    } catch (ex) {
      server.log.error(ex);
      return new ResponseApi(null, false, MSG_ERROR_DEFAULT, Errore.GENERICO);
    }
  });
};
