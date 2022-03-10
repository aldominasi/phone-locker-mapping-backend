import { FastifyInstance, FastifyPluginOptions, FastifyRequest, FastifyReply } from 'fastify';
import utentiSchema from '../../entities/utenti/utenti.schema';
import IUtenti from '../../entities/utenti/utenti.interface';
import { ResponseApi } from "../../models/ResponseApi";
import { MSG_ERROR_DEFAULT } from '../../utilities/defaultValue';
import { hash } from 'bcryptjs';
import { IQuerystringJwt } from "../../plugins/jwtHandler";

export default async (server: FastifyInstance, options: FastifyPluginOptions) => {
  /*
  REST API per registrare un nuovo utente
  Codici di errore:
  1 - Il client non ha eseguito la login oppure la sessione è scaduta
  2 - Errore nella verifica della sessione
  3 - Errore generico
   */
  server.post<{
    Querystring: IQuerystringJwt,
    Body: IUtenti
  }>('/', {
    constraints: {
      version: '1.0.0' // Header Accept-Version
    },
    onRequest: server.verifyAuth // Verifica il token jwt restituito all'attod della login
  }, async (request, reply): Promise<ResponseApi> => {
    try {
      const tokenData = await server.getDataFromToken(request.query.token);
      if (tokenData == null)
        return new ResponseApi(null, false, MSG_ERROR_DEFAULT, 2);
      const permesso = await server.verificaPermessi(tokenData.id, 'writeUtenti');
      if (!permesso)
        return new ResponseApi(null, false, "Accesso non autorizzato", 3);
      request.body.password = await hash(request.body.password, parseInt(process.env.SALT_PWD ?? '8')); // Esegue l'encrypt della password
      const utenteCreato = await utentiSchema.create(request.body); // Crea l'utente
      return new ResponseApi(utenteCreato); // Risposta inviata al client
    } catch (ex) {
      server.log.error(ex);
      return new ResponseApi(null, false, MSG_ERROR_DEFAULT, 3);
    }
  });
};
