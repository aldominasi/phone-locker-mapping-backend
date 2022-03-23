import {FastifyInstance, FastifyPluginOptions, FastifyReply, FastifyRequest} from 'fastify';
import fp from 'fastify-plugin';
import utentiSchema from '../entities/utenti/utenti.schema';
import { DateTime } from 'luxon';
import { IQuerystringJwt } from './jwtHandler';
import { ResponseApi } from '../models/ResponseApi';

const DAYS = 90;

export default fp(async (server: FastifyInstance, options: FastifyPluginOptions) => {
  server.decorate('verificaPwdScaduta', async (request: FastifyRequest<{ Querystring: IQuerystringJwt }>, reply: FastifyReply): Promise<void> => {
    try {
      const tokenData = await server.getDataFromToken(request.query.token);
      if (tokenData == null)
        return reply.status(200).send(new ResponseApi(null, false, 'Il servizio non è al momento disponibile', 3));
      const utente = await utentiSchema.findById(tokenData?.id);
      if (utente == null)
        return reply.status(200).send(new ResponseApi(null, false, 'Il servizio non è al momento disponibile', 4));
      const ultimaModifica = DateTime.fromJSDate(utente.modPwdData);
      const createdAt = DateTime.fromJSDate(utente.createdAt);
      /*
      Controlla se l'ultima modifica della pwd coincide con la data di registrazione registrazione. Pertanto non è mai stata modificata (Primo Accesso)
      Inoltre controlla se sono passati più di 'DAYS' giorni dall'ultima modifica della password.
      */
      if (ultimaModifica.hasSame(createdAt, 'minute') || DateTime.local().diff(ultimaModifica, 'days').days >= DAYS)
        return reply.status(200).send(new ResponseApi(null, false, 'Il servizio non è al momento disponibile', 5));
    } catch (ex) {
      server.log.error(ex);
      return reply.status(200).send(new ResponseApi(null, false, 'Il servizio non è al momento disponibile', 1));
    }
  });
});

declare module 'fastify' {
  export interface FastifyInstance {
    verificaPwdScaduta: (request: FastifyRequest<{ Querystring: IQuerystringJwt }>, reply: FastifyReply) => Promise<ResponseApi | undefined>;
  }
}
