import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import armadiSchema from '../../entities/armadi/armadi.schema';
import { IQuerystringJwt } from '../../plugins/jwtHandler';
import { ResponseApi } from '../../models/ResponseApi';
import { MSG_ERROR_DEFAULT } from '../../utilities/defaultValue';
import { PipelineStage } from 'mongoose';
import S from 'fluent-json-schema';
import ResponseApiSerialization from '../../schemas/serializations/responseApi.serialization';

interface IQuery extends IQuerystringJwt {
  centrale?: string;
}

export default async (server: FastifyInstance, options: FastifyPluginOptions) => {
  /*
  REST API per recuperare la lista delle zone
  Codici di errore:
  1 - Errore generico
  2 - Token non valido o scaduto
  3 - Errore nel recupero delle informazioni presenti nel token
  4 - L'utente non ha il permesso di accedere all'API
   */
  server.get<{
    Querystring: IQuery
  }>('/', {
    constraints: {
      version: '1.0.0'
    },
    schema: {
      querystring: S.object()
        .prop('token', S.string().required())
        .prop('centrale', S.string()),
      response: {
        '200': ResponseApiSerialization.prop('data', S.array().items(S.string())).raw({ nullable: true })
      }
    }
  }, async (request, reply): Promise<ResponseApi> => {
    try {
      const filtri: PipelineStage[] = [{ $group: { _id: '$zona.info1' } }]; // Pipeline per il raggruppamento
      if (request.query.centrale) // Se il filtro centrale è presente nella richiesta aggiungo la pipeline match
        filtri.unshift({ $match: { centrale: request.query.centrale } });
      // Recupero le zone ed eseguo un remapping dei dati per restituire la lista nel formato atteso dal client
      const zone: string[] = (await armadiSchema.aggregate(filtri).exec()).map(item => item._id);
      return new ResponseApi(zone);
    } catch (ex) {
      server.log.error(ex);
      return new ResponseApi(null, false, MSG_ERROR_DEFAULT, 1);
    }
  });
};

