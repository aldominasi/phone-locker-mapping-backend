import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import comuniSchema from '../../entities/comuni/comuni.schema';
import { MSG_ERROR_DEFAULT } from '../../utilities/defaultValue';
import { ResponseApi } from '../../models/ResponseApi';
import { queryVal } from '../../schemas/validations/comuni.validation';
import comuniSerialization from '../../schemas/serializations/comuni.serialization';

enum Errore {
  GENERICO = 'ERR_COM_BY_PROV_1'
}

interface IQuery {
  codice: string;
}

export default async (server: FastifyInstance, options: FastifyPluginOptions): Promise<void> => {
  server.get<{
    Querystring: IQuery
  }>('/byProvincia', {
    constraints: {
      version: '1.0.0'
    },
    schema: {
      querystring: queryVal,
      response: {
        '200': comuniSerialization
      }
    }
  }, async (request, reply): Promise<ResponseApi> => {
    try {
      const comuni = await comuniSchema.aggregate([
        { $match: { 'provincia.codice': request.query.codice } },
        { $group: { _id: '$codice', nome: { $first: '$nome' } } },
        { $sort: { nome: 1 } }
      ]).exec();
      return new ResponseApi(comuni.map(item => {
        return { codice: item._id, nome: item.nome };
      }));
    } catch (ex) {
      server.log.error(ex);
      return new ResponseApi(null, false, MSG_ERROR_DEFAULT, Errore.GENERICO);
    }
  });
};
