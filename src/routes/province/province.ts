import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import comuniSchema from '../../entities/comuni/comuni.schema';
import { ResponseApi } from '../../models/ResponseApi';
import { MSG_ERROR_DEFAULT } from '../../utilities/defaultValue';
import provinceSerialization from '../../schemas/serializations/province.serialization';

enum Errore {
  GENERICO = 'ERR_PROV_1',
}

export default async (server: FastifyInstance, options: FastifyPluginOptions): Promise<void> => {
  server.get('/', {
    constraints: {
      version: '1.0.0'
    },
    schema: {
      response: {
        '200': provinceSerialization
      }
    },
  }, async (request, reply): Promise<ResponseApi> => {
    try {
      const province = await comuniSchema.aggregate([
        { $group: { _id: '$provincia.codice', nome: { $first: '$provincia.nome' } } },
        { $sort: { 'nome': 1 } }
      ]).exec();
      return new ResponseApi(province.map(item => {
        return { nome: item.nome, codice: item._id };
      }));
    } catch (ex) {
      server.log.error(ex);
      return new ResponseApi(null, false, MSG_ERROR_DEFAULT, Errore.GENERICO);
    }
  });
};
