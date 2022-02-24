import { FastifyInstance, FastifyPluginOptions, FastifyRequest, FastifyReply } from 'fastify';
import utentiSchema from '../../entities/utenti/utenti.schema';
import IUtenti from '../../entities/utenti/utenti.interface';
import { MSG_ERROR_DEFAULT } from '../../utilities/defaultValue';
import { ResponseApi } from "../../models/ResponseApi";

export default async (server: FastifyInstance, options: FastifyPluginOptions) => {
  /*
  REST API per recuperare le info dell'utente
  Codici di errore:
  1 - Il client non ha eseguito la login oppure la sessione è scaduta
  2 - Errore nella verifica della sessione
  3 - Errore info jwt
  4 - Utente non trovato
  5 - Errore generico
   */
  server.get('/me', {
    constraints: {
      version: '1.0.0' // Header Accept-Version
    },
    preHandler: server.verifyAuth // Verifica la sessione dell'utenza
  }, async (request: FastifyRequest, reply: FastifyReply): Promise<ResponseApi> => {
    try {
      const tokenData = server.getDataFromToken(request); // Recupera le informazioni contenute nel token jwt
      if (tokenData == null) // Informazioni non recuperate
        return new ResponseApi(null, false, MSG_ERROR_DEFAULT, 3);
      const utente: null | IUtenti = await utentiSchema.findById(tokenData.id, {_id: 0, password: 0}).exec(); // Recupera l'utente
      if (utente == null) // Utente non trovato
        return new ResponseApi(null, false, MSG_ERROR_DEFAULT, 4);
      return new ResponseApi(utente); // Risposta inviata al client
    } catch (ex) {
      server.log.error(ex);
      return new ResponseApi(null, false, MSG_ERROR_DEFAULT, 5);
    }
  });
};
