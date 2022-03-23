import { FastifyInstance, FastifyPluginOptions, FastifyRequest, FastifyReply } from 'fastify';
import { IQuerystringJwt } from '../../plugins/jwtHandler';
import { ResponseApi } from '../../models/ResponseApi';
import armadiSchema from '../../entities/armadi/armadi.schema';
import S from 'fluent-json-schema';
import ResponseApiSerialization from '../../schemas/serializations/responseApi.serialization';
import { MSG_ERROR_DEFAULT } from '../../utilities/defaultValue';

export default async (server: FastifyInstance, options: FastifyPluginOptions): Promise<void> => {
  /*
  REST API per recuperare la lista delle centrali presenti nel db
  Codici di errore:
  1 - Errore generico
  2 - Token non valido o scaduto
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
          S.array().items(S.string())).raw({ nullable: true })
      }
    },
    onRequest: [server.verifyAuth, server.verifyAuth]
  }, async (request, reply): Promise<ResponseApi> => {
    try {
      const centrali: string[] = (await armadiSchema.aggregate([
        { $group: { _id: '$centrale' } }
      ]).exec()).map(centrale => centrale._id);
      return new ResponseApi(centrali);
    } catch (ex) {
      server.log.error(ex);
      return new ResponseApi(null, false, MSG_ERROR_DEFAULT, 1);
    }
  });
};
