import {FastifyInstance, FastifyPluginOptions, FastifyReply, FastifyRequest} from 'fastify';
import fp from 'fastify-plugin';
import utentiSchema from '../entities/utenti/utenti.schema';
import { DateTime } from 'luxon';
import { IQuerystringJwt } from './jwtHandler';
import { ResponseApi } from '../models/ResponseApi';

export const GIORNI_VALIDITA_PWD = 90;
enum Errore {
  GENERICO = 'ERR_PWD_1',
  INFO_UTENTE = 'ERR_PWD_2',
  UTENTE_NON_TROVATO = 'ERR_PWD_3',
  PWD_SCADUTA = 'ERR_PWD_4'
}

/**
 * Codici di errore per la verifica della pwd:
 * ERR_PWD_1 - Errore generico
 * ERR_PWD_2 - Errore nel recupero delle informazioni dal token
 * ERR_PWD_3 - Utente non trovato
 * ERR_PWD_4 - Password scaduta
 */
export default fp(async (server: FastifyInstance, options: FastifyPluginOptions) => {
  server.decorate('verificaPwdScaduta', async (request: FastifyRequest<{ Querystring: IQuerystringJwt }>, reply: FastifyReply): Promise<void> => {
    try {
      const tokenData = await server.getDataFromToken(request.query.token);
      if (tokenData == null)
        return reply.status(200).send(new ResponseApi(null, false, 'Il servizio non è al momento disponibile', Errore.INFO_UTENTE));
      const utente = await utentiSchema.findById(tokenData?.id);
      // Controlla che l'utente sia presente in piattaforma
      if (utente == null)
        return reply.status(200).send(new ResponseApi(null, false, 'Il servizio non è al momento disponibile', Errore.UTENTE_NON_TROVATO));
      // Controlla che l'utente abbia cambiato la password almeno una volta
      if (utente.pwdScaduta == null)
        return reply.status(200).send(new ResponseApi(null, false, 'Il servizio non è al momento disponibile', Errore.PWD_SCADUTA));
      // Controlla se la password è scaduta
      if (DateTime.fromJSDate(utente.pwdScaduta).diffNow().milliseconds <= 0)
        return reply.status(200).send(new ResponseApi(null, false, 'Il servizio non è al momento disponibile', Errore.PWD_SCADUTA));
    } catch (ex) {
      server.log.error(ex);
      return reply.status(200).send(new ResponseApi(null, false, 'Il servizio non è al momento disponibile', Errore.GENERICO));
    }
  });
});

declare module 'fastify' {
  export interface FastifyInstance {
    verificaPwdScaduta: (request: FastifyRequest<{ Querystring: IQuerystringJwt }>, reply: FastifyReply) => Promise<ResponseApi | undefined>;
  }
}
