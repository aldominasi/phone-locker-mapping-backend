import { FastifyInstance, FastifyPluginOptions, FastifyRequest, FastifyReply } from 'fastify';
import { IQuerystringJwt } from '../../../plugins/jwtHandler';
import { ResponseApi } from '../../../models/ResponseApi';
import armadiSchema from '../../../entities/armadi/armadi.schema';
import { MSG_ERROR_DEFAULT } from '../../../utilities/defaultValue';
import ResponseApiSerialization from '../../../schemas/serializations/responseApi.serialization';
import S from "fluent-json-schema";

enum Errore {
  GENERICO = 'ERR_PROV_CEN_1'
}

export default async (server: FastifyInstance, options: FastifyPluginOptions): Promise<void> => {
  /*
  REST API per recuperare la lista delle centrali presenti nel db in base
  alla provincia ricevuta nel payload
  Codici di errore:
  ERR_CEN_PROV_1 - Errore generico
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
    onRequest: [ server.verifyAuth, server.verificaPwdScaduta ]
  }, async (request, reply) => {
    try {
      const province = await armadiSchema.aggregate([
        { $group: { _id: '$provincia.codice', nome: { $first: '$provincia.nome' } } },
        { $sort: { nome: 1 } }
      ]).exec();
      return new ResponseApi(province.map(item => {
        return { codice: item._id, nome: item.nome };
      }));
    } catch (ex) {
      server.log.error(ex);
      return new ResponseApi(null, false, MSG_ERROR_DEFAULT, Errore.GENERICO);
    }
  });
};
