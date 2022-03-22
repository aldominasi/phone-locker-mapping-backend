import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { ResponseApi } from '../../models/ResponseApi';
import S from 'fluent-json-schema';
import ResponseApiSerialization from '../../schemas/serializations/responseApi.serialization';
import { IQuerystringJwt } from '../../plugins/jwtHandler';

export default async (server: FastifyInstance, options: FastifyPluginOptions) => {
  /*
  REST API per verificare il token di accesso
  Codici di errore:
  2 - Token non valido o scaduto
   */
  server.get<{
    Querystring: IQuerystringJwt
  }>('/verificatoken', {
    constraints: {
      version: '1.0.0'
    },
    schema: {
      querystring: S.object().prop('token', S.string().required()),
      response: {
        '200': ResponseApiSerialization.prop('data', S.boolean()).raw({ nullable: true })
      }
    },
    preHandler: server.verifyAuth
  },async (request, reply): Promise<ResponseApi> => {
    return new ResponseApi(true);
  });
};
