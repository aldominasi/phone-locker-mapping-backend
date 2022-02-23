import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import armadiSchema from '../../entities/armadi/armadi.schema';
import IArmadi from '../../entities/armadi/armadi.interface';
import { ResponseApi } from '../../models/ResponseApi';
import { MSG_ERROR_DEFAULT } from '../../utilities/defaultValue';
import { paramsArmadi, queryArmadi } from '../../schemas/validations/getArmadi.validation';
import { responseArmadio, responsePagination } from '../../schemas/serializations/getArmadi.serialization';

interface IParams {
  id: string;
}

interface IQuery {
  page: number;
  limit: number;
}

export default async (server: FastifyInstance, options: FastifyPluginOptions) => {
  /*
  REST API per recuperare le informazioni dell'armadio
  Codici di errore:
  1 - Errore generico
  2 - Armadio non trovato
   */
  server.get<{
    Params: IParams
  }>('/:id', {
    constraints: {
      version: '1.0.0'
    },
    schema: {
      params: paramsArmadi,
      response: {
        '200': responseArmadio
      }
    }
  }, async (request, reply): Promise<ResponseApi> => {
    try {
      const armadio: IArmadi | null = await armadiSchema.findById(request.params.id).exec();
      if (armadio == null) {
        return new ResponseApi(null, false, 'Armadio non trovato', 2);
      }
      return new ResponseApi(armadio);
    } catch (ex) {
      server.log.error(ex);
      return new ResponseApi(null, false, MSG_ERROR_DEFAULT, 1);
    }
  });
  /*
  REST API per recuperare la lista degli armadi utilizzando il metodo della paginazione
  Codici di errore:
  1 - Errore generico
   */
  server.get<{
    Querystring: IQuery
  }>('/', {
    constraints: {
      version: '1.0.0'
    },
    schema: {
      querystring: queryArmadi,
      response: {
        '200': responsePagination
      }
    }
  }, async (request, reply) => {
    try {
      const armadi: IArmadi[] = await armadiSchema.find()
        .skip(request.query.page * request.query.limit)
        .limit(request.query.limit)
        .exec();
      const countDocuments: number = await armadiSchema.countDocuments().exec();
      return new ResponseApi({
        documentiTotali: countDocuments,
        pagina: request.query.page,
        documentiPagina: armadi.length,
        armadi: armadi
      });
    } catch (ex) {
      server.log.error(ex);
      return new ResponseApi(null, false, MSG_ERROR_DEFAULT, 2);
    }
  });
};

