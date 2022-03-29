import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import comuniSchema from '../../entities/comuni/comuni.schema';
import IComuni from '../../entities/comuni/comuni.interface';
import { MSG_ERROR_DEFAULT } from '../../utilities/defaultValue';
import { ResponseApi } from '../../models/ResponseApi';
import comuniSerialization from '../../schemas/serializations/comuni.serialization';
import { queryVal } from '../../schemas/validations/comuni.validation';

enum Errore {
  GENERICO = 'ERR_COM_1'
}

interface IQuery {
  nome: string;
  regione: string;
}

export default async (server: FastifyInstance, options: FastifyPluginOptions): Promise<void> => {
  server.get<{
    Querystring: IQuery
  }>('/ricercanome', {
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
      const result: IComuni[] = await comuniSchema.find({
        $and: [
          { 'regione.codice': request.query.regione },
          { 'nome': { $regex: `^${request.query.nome}.*$`, $options: 'i' } }
        ]
      }).exec();
      return new ResponseApi(result);
    } catch (ex) {
      server.log.error(ex);
      return new ResponseApi(null, false, MSG_ERROR_DEFAULT, Errore.GENERICO);
    }
  });
};
