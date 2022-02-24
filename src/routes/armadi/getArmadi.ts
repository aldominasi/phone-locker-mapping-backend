import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import armadiSchema from '../../entities/armadi/armadi.schema';
import IArmadi from '../../entities/armadi/armadi.interface';
import { ResponseApi } from '../../models/ResponseApi';
import { MSG_ERROR_DEFAULT } from '../../utilities/defaultValue';
import { paramsArmadi, queryArmadi } from '../../schemas/validations/getArmadi.validation';
import { responseArmadio, responsePagination } from '../../schemas/serializations/getArmadi.serialization';

interface IParams { // Interfaccia params della request
  id: string; // id dell'armadio
}

interface IQuery { // Interfaccia delle querystring della request
  page: number; // numero di pagina
  limit: number; // numero di item per pagina
}

export default async (server: FastifyInstance, options: FastifyPluginOptions) => {
  /*
  REST API per recuperare le informazioni dell'armadio
  Codici di errore:
  1 - Il client non ha eseguito la login oppure la sessione è scaduta
  2 - Errore nella verifica della sessione
  3 - Armadio non trovato
  4 - Errore generico
   */
  server.get<{
    Params: IParams
  }>('/:id', {
    constraints: {
      version: '1.0.0' // Header Accept-Version
    },
    schema: {
      params: paramsArmadi, // Validazione dei parametri della request
      response: {
        '200': responseArmadio // Serializzazione della risposta
      }
    },
    preHandler: server.verifyAuth // Verifica la sessione dell'utenza
  }, async (request, reply): Promise<ResponseApi> => {
    try {
      const armadio: IArmadi | null = await armadiSchema.findById(request.params.id).exec(); // Recupero l'armadio
      if (armadio == null) { // Armadio non trovato
        return new ResponseApi(null, false, 'Armadio non trovato', 3);
      }
      return new ResponseApi(armadio); // Invia al client l'armadio
    } catch (ex) {
      server.log.error(ex);
      return new ResponseApi(null, false, MSG_ERROR_DEFAULT, 4);
    }
  });
  /*
  REST API per recuperare la lista degli armadi utilizzando il metodo della paginazione
  Codici di errore:
  1 - Errore generico
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
  }, async (request, reply) => {
    try {
      // Recupera la lista degli armadi secondo i parametri inviati dal client
      const armadi: IArmadi[] = await armadiSchema.find()
        .skip(request.query.page * request.query.limit)
        .limit(request.query.limit)
        .exec();
      const countDocuments: number = await armadiSchema.countDocuments().exec(); // Restituisce il numero degli armadi presenti nel DB
      return new ResponseApi({ // Risposta inviata al client
        documentiTotali: countDocuments, // Numero degli armadi presenti nel DB
        pagina: request.query.page, // numero della pagina
        documentiPagina: armadi.length, // Numero degli armadi presenti in pagina
        armadi: armadi // Lista degli armadi trovati
      });
    } catch (ex) {
      server.log.error(ex);
      return new ResponseApi(null, false, MSG_ERROR_DEFAULT, 2);
    }
  });
};

