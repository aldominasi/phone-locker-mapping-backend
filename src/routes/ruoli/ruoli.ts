import { FastifyInstance, FastifyPluginOptions, FastifyRequest, FastifyReply } from 'fastify';
import serializeReply from '../../schemas/serializations/ruoli.serialization';
import ruoliSchema from '../../entities/ruoli/ruoli.schema';
import { ResponseApi } from '../../models/ResponseApi';
import { MSG_ERROR_DEFAULT } from '../../utilities/defaultValue';

export default async (server: FastifyInstance, options: FastifyPluginOptions) => {
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
      const ruoli = await ruoliSchema.find().exec();
      return new ResponseApi(ruoli);
    } catch (ex) {
      server.log.error(ex);
      return new ResponseApi(null, false, MSG_ERROR_DEFAULT, 2);
    }
  });
};
