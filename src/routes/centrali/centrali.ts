import { FastifyInstance, FastifyPluginOptions, FastifyRequest, FastifyReply } from 'fastify';
import { IQuerystringJwt } from '../../plugins/jwtHandler';
import { ResponseApi } from '../../models/ResponseApi';
import armadiSchema from '../../entities/armadi/armadi.schema';
import S from 'fluent-json-schema';
import ResponseApiSerialization from '../../schemas/serializations/responseApi.serialization';

export default async (server: FastifyInstance, options: FastifyPluginOptions): Promise<void> => {
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
    onRequest: server.verifyAuth
  }, async (request, reply): Promise<ResponseApi> => {
    const centrali: string[] = (await armadiSchema.aggregate([
      { $group: { _id: '$centrale' } }
    ]).exec()).map(centrale => centrale._id);
    return new ResponseApi(centrali);
  });
};
