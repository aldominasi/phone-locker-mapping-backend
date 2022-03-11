import { FastifyInstance, FastifyPluginOptions, FastifyRequest, FastifyReply } from 'fastify';
import IArmadi from '../../entities/armadi/armadi.interface';
import armadiSchema from '../../entities/armadi/armadi.schema';
import { IQuerystringJwt } from '../../plugins/jwtHandler';
import { ResponseApi } from '../../models/ResponseApi';
import { MSG_ERROR_DEFAULT } from '../../utilities/defaultValue';
import { queryVal, bodyVal } from '../../schemas/validations/registraArmadio.validation';
import serializeReply from '../../schemas/serializations/registraArmadio.serialization';

export default async (server: FastifyInstance, options: FastifyPluginOptions) => {
  server.post<{
    Querystring: IQuerystringJwt,
    Body: IArmadi
  }>('/', {
    constraints: {
      version: '1.0.0'
    },
    schema: {
      querystring: queryVal,
      body: bodyVal,
      response: {
        '201': serializeReply
      }
    },
    onRequest: server.verifyAuth
  }, async (request, reply) => {
    try {
      const tokenData = await server.getDataFromToken(request.query.token);
      if (tokenData == null)
        return new ResponseApi(null, false, MSG_ERROR_DEFAULT, 2);
      const permesso: boolean = await server.verificaPermessi(tokenData.id, 'writeArmadi');
      if (!permesso)
        return new ResponseApi(null, false, 'Accesso non autorizzato', 2);
      const result = await armadiSchema.create(request.body);
      return reply.code(201).send(new ResponseApi(result));
    } catch (ex) {
      server.log.error(ex);
      return new ResponseApi(null, false, MSG_ERROR_DEFAULT, 4);
    }
  });
};
