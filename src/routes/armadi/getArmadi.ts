import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import armadiSchema from '../../entities/armadi/armadi.schema';
import IArmadi from '../../entities/armadi/armadi.interface';
import { ResponseApi } from '../../models/ResponseApi';
import { MSG_ERROR_DEFAULT } from '../../utilities/defaultValue';
import {
  paramsArmadi,
  queryArmadi,
  queryArmadio
} from '../../schemas/validations/getArmadi.validation';
import { responseArmadio, responsePagination } from '../../schemas/serializations/getArmadi.serialization';
import { IQuerystringJwt } from '../../plugins/jwtHandler';

interface IParams { // Interfaccia params della request
  id: string; // id dell'armadio
}

interface IQuery extends IQuerystringJwt { // Interfaccia delle querystring della request
  page: number; // numero di pagina
  limit: number; // numero di item per pagina
  centrale?: string; // filtro per la ricerca (nome della centrale)
  zona?: string;
}

interface IFiltroRicerca {
  centrale?: string;
  'zona.info1'?: string;
}

export default async (server: FastifyInstance, options: FastifyPluginOptions) => {
  /*
  REST API per recuperare le informazioni dell'armadio
  Codici di errore:
  1 - Errore generico
  2 - Token non valido o scaduto
  3 - Errore nel recupero delle informazioni presenti nel token
  4 - L'utente non ha il permesso di accedere all'API
  5 - Armadio non trovato
   */
  server.get<{
    Querystring: IQuerystringJwt,
    Params: IParams
  }>('/:id', {
    constraints: {
      version: '1.0.0' // Header Accept-Version
    },
    schema: {
      params: paramsArmadi, // Validazione dei parametri della request
      querystring: queryArmadio,
      response: {
        '200': responseArmadio // Serializzazione della risposta
      }
    },
    preHandler: server.verifyAuth // Verifica la sessione dell'utenza
  }, async (request, reply): Promise<ResponseApi> => {
    try {
      const tokenData = await server.getDataFromToken(request.query.token);
      if (tokenData == null)
        return new ResponseApi(null, false, MSG_ERROR_DEFAULT, 3);
      const permesso: boolean = await server.verificaPermessi(tokenData.id, 'readArmadi');
      if (!permesso)
        return new ResponseApi(null, false, 'Accesso non autorizzato', 4);
      const armadio: IArmadi | null = await armadiSchema.findById(request.params.id).exec(); // Recupero l'armadio
      if (armadio == null) { // Armadio non trovato
        return new ResponseApi(null, false, 'Armadio non trovato', 5);
      }
      return new ResponseApi(armadio); // Invia al client l'armadio
    } catch (ex) {
      server.log.error(ex);
      return new ResponseApi(null, false, MSG_ERROR_DEFAULT, 1);
    }
  });
  /*
  REST API per recuperare la lista degli armadi utilizzando il metodo della paginazione
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
      querystring: queryArmadi, // Validazione della querystring
      response: {
        '200': responsePagination // Serializzazione della risposta
      }
    },
    preHandler: server.verifyAuth // Verifica la sessione dell'utenza
  }, async (request, reply): Promise<ResponseApi> => {
    try {
      const tokenData = await server.getDataFromToken(request.query.token);
      if (tokenData == null)
        return new ResponseApi(null, false, MSG_ERROR_DEFAULT, 3);
      const permesso: boolean = await server.verificaPermessi(tokenData.id, 'readArmadi');
      if (!permesso)
        return new ResponseApi(null, false, 'Accesso non autorizzato', 4);
      const filtri: IFiltroRicerca = {};
      if (request.query.centrale)
        filtri.centrale = request.query.centrale;
      if (request.query.zona)
        filtri['zona.info1'] = request.query.zona;
      // Recupera la lista degli armadi secondo i parametri inviati dal client
      const armadi: IArmadi[] = await armadiSchema.find(filtri)
        .skip(request.query.page * request.query.limit)
        .limit(request.query.limit)
        .exec();
      const countDocuments: number = await armadiSchema.countDocuments(filtri).exec(); // Restituisce il numero degli armadi presenti nel DB
      return new ResponseApi({ // Risposta inviata al client
        documentiTotali: countDocuments, // Numero degli armadi presenti nel DB
        pagina: request.query.page, // numero della pagina
        documentiPagina: armadi.length, // Numero degli armadi presenti in pagina
        armadi: armadi // Lista degli armadi trovati
      });
    } catch (ex) {
      server.log.error(ex);
      return new ResponseApi(null, false, MSG_ERROR_DEFAULT, 1);
    }
  });
};

