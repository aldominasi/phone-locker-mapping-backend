import { FastifyInstance, FastifyPluginOptions, FastifyRequest, FastifyReply } from 'fastify';
import utentiSchema from '../../entities/utenti/utenti.schema';
import { MSG_ERROR_DEFAULT } from '../../utilities/defaultValue';
import { ResponseApi } from '../../models/ResponseApi';
import { IQuerystringJwt } from '../../plugins/jwtHandler';
import { queryInfoPers } from '../../schemas/validations/infoPersonali.validation';
import { responseInfoPersonali } from '../../schemas/serializations/infoPersonali.serialization';
import { IRuoli, IPermessi } from '../../entities/ruoli/ruoli.interface';
import ruoliSchema from '../../entities/ruoli/ruoli.schema';

export default async (server: FastifyInstance, options: FastifyPluginOptions) => {
  /*
  REST API per recuperare le info dell'utente
  Codici di errore:
  1 - Errore generico
  2 - Token non valido o scaduto
  3 - Errore nel recupero delle informazioni presenti nel token
  4 - Utente non trovato
  5 - Il ruolo associato all'utente non è presente in piattaforma
   */
  server.get<{
    Querystring: IQuerystringJwt
  }>('/me', {
    constraints: {
      version: '1.0.0' // Header Accept-Version
    },
    schema: {
      querystring: queryInfoPers,
      response: {
        '200': responseInfoPersonali
      }
    },
    onRequest: [server.verifyAuth, server.verificaPwdScaduta] // Verifica la sessione dell'utenza
  }, async (request, reply: FastifyReply): Promise<ResponseApi> => {
    try {
      const tokenData = server.getDataFromToken(request.query.token); // Recupera le informazioni contenute nel token jwt
      if (tokenData == null) // Informazioni non recuperate
        return new ResponseApi(null, false, MSG_ERROR_DEFAULT, 3);
      const utente = await utentiSchema.findById(tokenData.id, {_id: 0, password: 0}).exec(); // Recupera l'utente
      if (utente == null) // Utente non trovato
        return new ResponseApi(null, false, MSG_ERROR_DEFAULT, 4);
      const ruolo: IRuoli | null = await ruoliSchema.findById(utente.ruolo).exec();
      if (ruolo == null) // Ricerco il ruolo nella collection ruolis per recuperare le info associate al ruolo dell'utente
        return new ResponseApi(null, false, MSG_ERROR_DEFAULT, 5);
      return new ResponseApi({
        ...utente.toObject(),
        permessi: ruolo.permessi
      }); // Risposta inviata al client
    } catch (ex) {
      server.log.error(ex);
      return new ResponseApi(null, false, MSG_ERROR_DEFAULT, 1);
    }
  });
};
