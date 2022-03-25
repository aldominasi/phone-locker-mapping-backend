import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import serializeReply from '../../schemas/serializations/ruoli.serialization';
import ruoliSchema from '../../entities/ruoli/ruoli.schema';
import { ResponseApi } from '../../models/ResponseApi';
import { MSG_ERROR_DEFAULT } from '../../utilities/defaultValue';

enum Errore {
  GENERICO = 'ERR_RUOLI_1'
}

export default async (server: FastifyInstance, options: FastifyPluginOptions) => {
  /*
  REST API per recuperare la lista dei ruoli
  Codici di errore:
  ERR_RUOLI_1 - Errore generico
   */
  server.get('/', {
    constraints: {
      version: '1.0.0'
    },
    schema: {
      response: {
        '200': serializeReply
      }
    }
  }, async (request, reply) => {
    try {
      const ruoli = await ruoliSchema.find().exec(); // Recupero la lista dei ruoli
      return new ResponseApi(ruoli);
    } catch (ex) {
      server.log.error(ex);
      return new ResponseApi(null, false, MSG_ERROR_DEFAULT, Errore.GENERICO);
    }
  });
};
