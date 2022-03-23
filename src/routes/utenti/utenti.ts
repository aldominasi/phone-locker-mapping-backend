import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import IUtenti from '../../entities/utenti/utenti.interface';
import utentiSchema from '../../entities/utenti/utenti.schema';
import { IQuerystringJwt } from '../../plugins/jwtHandler';
import { ResponseApi } from '../../models/ResponseApi';
import { MSG_ERROR_DEFAULT } from '../../utilities/defaultValue';
import queryValidation from '../../schemas/validations/utenti.validation';
import replySerialize from '../../schemas/serializations/utenti.serialization';

interface IQuery extends IQuerystringJwt { // Interfaccia per la querystring della request
  page: number; // Numero di pagina
  limit: number; // Numero degli elementi per pagina
  email?: string; // filtro per query
  ruolo?: string; // filtro per la query
}

interface IQueryUtenti {
  email?: string;
  ruolo?: string;
}

export default async (server: FastifyInstance, options: FastifyPluginOptions) => {
  /*
  REST API per recuperare la lista degli utenti
  Codici di errore:
  1 - Errore generico
  2 - Token non valido o scaduto
  3 - Errore nel recupero delle informazioni presenti nel token
  4 - L'utente non ha il permesso di accedere all'API
   */
  server.get<{
    Querystring: IQuery
  }>('/', {
    constraints: {
      version: '1.0.0' // Header Accept-Version
    },
    schema: {
      querystring: queryValidation,
      response: {
        '200': replySerialize
      }
    },
    onRequest: [server.verifyAuth, server.verificaPwdScaduta] // Verifica il token jwt restituito all'attod della login
  }, async (request, reply) => {
    try {
      const tokenData = await server.getDataFromToken(request.query.token); // Recupero le info dal token
      if (tokenData == null)
        return new ResponseApi(null, false, MSG_ERROR_DEFAULT, 3);
      const permesso = await server.verificaPermessi(tokenData.id, 'readUtenti'); // Controllo i permessi dell'utente
      if (!permesso)
        return new ResponseApi(null, false, 'Accesso non autorizzato', 4);
      // Creo la query con i dati presenti nella richiesta
      const query: IQueryUtenti = {};
      if (request.query.email != null)
        query.email = request.query.email;
      if (request.query.ruolo != null)
        query.ruolo = request.query.ruolo;
      const utenti: IUtenti[] = await utentiSchema.find(query, {
        _id: 0, password: 0, modPwdData: 0
      })
        .skip(request.query.page * request.query.limit)
        .limit(request.query.limit)
        .exec();
      // Restituisce il numero totale dei documenti in base ai filtri passati nella request
      const countDocuments: number = await utentiSchema.countDocuments().exec();
      return new ResponseApi({
        documentiTotali: countDocuments, // Numero degli utenti
        pagina: request.query.page, // Numero della pagina
        documentiPagina: utenti.length, // Numero degli utenti in pagina,
        utenti: utenti // Lista degli utenti trovati
      });
    } catch (ex) {
      server.log.error(ex);
      return new ResponseApi(null, false, MSG_ERROR_DEFAULT, 1);
    }
  });
};
