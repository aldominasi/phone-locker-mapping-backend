import { FastifyInstance, FastifyPluginOptions, FastifyRequest, FastifyReply } from 'fastify';
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
      const filtri: PipelineStage[] = [{ $group: { _id: '$zona.info1' } }];
      if (request.query.centrale)
        filtri.unshift({ $match: { centrale: request.query.centrale } });
      const zone: string[] = (await armadiSchema.aggregate(filtri).exec()).map(item => item._id);
      return new ResponseApi(zone);
    } catch (ex) {
      server.log.error(ex);
      return new ResponseApi(null, false, MSG_ERROR_DEFAULT, 4);
    }
  });
};

