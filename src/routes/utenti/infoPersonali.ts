import { FastifyInstance, FastifyPluginOptions, FastifyRequest, FastifyReply } from 'fastify';
import utentiSchema from '../../entities/utenti/utenti.schema';
import { MSG_ERROR_DEFAULT } from '../../utilities/defaultValue';
import { ResponseApi } from '../../models/ResponseApi';
import { IQuerystringJwt } from '../../plugins/jwtHandler';
import { queryInfoPers } from '../../schemas/validations/infoPersonali.validation';
import { responseInfoPersonali } from '../../schemas/serializations/infoPersonali.serialization';
import { IRuoli, IPermessi } from '../../entities/ruoli/ruoli.interface';
import ruoliSchema from '../../entities/ruoli/ruoli.schema';

enum Errore {
  GENERICO = 'ERR_ME_1',
  INFO_UTENTE = 'ERR_ME_2',
  UTENTE_NON_TROVATO = 'ERR_ME_3',
  RUOLO_NON_TROVATO = 'ERR_ME_4'
}

export default async (server: FastifyInstance, options: FastifyPluginOptions) => {
  /*
  REST API per recuperare le info dell'utente
  Codici di errore:
  ERR_ME_1 - Errore generico
  ERR_ME_2 - Errore nel recupero delle informazioni presenti nel token
  ERR_ME_3 - Utente non trovato
  ERR_ME_4 - Il ruolo associato all'utente non è presente in piattaforma
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
        return new ResponseApi(null, false, MSG_ERROR_DEFAULT, Errore.INFO_UTENTE);
      const utente = await utentiSchema.findById(tokenData.id, {_id: 0, password: 0}).exec(); // Recupera l'utente
      if (utente == null) // Utente non trovato
        return new ResponseApi(null, false, MSG_ERROR_DEFAULT, Errore.UTENTE_NON_TROVATO);
      const ruolo: IRuoli | null = await ruoliSchema.findById(utente.ruolo).exec();
      if (ruolo == null) // Ricerco il ruolo nella collection ruolis per recuperare le info associate al ruolo dell'utente
        return new ResponseApi(null, false, MSG_ERROR_DEFAULT, Errore.RUOLO_NON_TROVATO);
      return new ResponseApi({
        ...utente.toObject(),
        permessi: ruolo.permessi
      }); // Risposta inviata al client
    } catch (ex) {
      server.log.error(ex);
      return new ResponseApi(null, false, MSG_ERROR_DEFAULT, Errore.GENERICO);
    }
  });
};
