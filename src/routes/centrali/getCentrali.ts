import { FastifyInstance, FastifyPluginOptions, FastifyRequest, FastifyReply } from 'fastify';
import { IQuerystringJwt } from '../../plugins/jwtHandler';
import { ResponseApi } from '../../models/ResponseApi';
import armadiSchema from '../../entities/armadi/armadi.schema';
import S from 'fluent-json-schema';
import ResponseApiSerialization from '../../schemas/serializations/responseApi.serialization';
import { MSG_ERROR_DEFAULT } from '../../utilities/defaultValue';

enum Errore {
  GENERICO = 'ERR_CEN_1'
}

interface ICentraleResponse {
  codice: string;
  nome: string;
}

export default async (server: FastifyInstance, options: FastifyPluginOptions): Promise<void> => {
  /*
  REST API per recuperare la lista delle centrali presenti nel db
  Codici di errore:
  ERR_CEN_1 - Errore generico
   */
  server.get<{
    Querystring: IQuerystringJwt
  }>('/', {
    constraints: {
      version: '1.0.0'
    },
    schema: {
      querystring: S.object().prop('token', S.string().required()),
      response: {
        '200': ResponseApiSerialization.prop('data',
          S.array().items(
            S.object()
              .prop('codice', S.string())
              .prop('nome', S.string())
          )).raw({ nullable: true })
      }
    },
    onRequest: [server.verifyAuth, server.verificaPwdScaduta]
  }, async (request, reply): Promise<ResponseApi> => {
    try {
      const centrali: ICentraleResponse[] = (await armadiSchema.aggregate([
        { $group: { _id: '$centrale.codice', nome: { $first: '$centrale.nome' } } }
      ]).exec()).map(centrale => { return { codice: centrale._id, nome: centrale.nome }; });
      return new ResponseApi(centrali);
    } catch (ex) {
      server.log.error(ex);
      return new ResponseApi(null, false, MSG_ERROR_DEFAULT, Errore.GENERICO);
    }
  });
};
