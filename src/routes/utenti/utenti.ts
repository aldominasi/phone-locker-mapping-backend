import { FastifyInstance, FastifyPluginOptions, FastifyRequest, FastifyReply } from 'fastify';
import IUtenti from '../../entities/utenti/utenti.interface';
import utentiSchema from '../../entities/utenti/utenti.schema';
import { IQuerystringJwt } from '../../plugins/jwtHandler';
import { ResponseApi } from '../../models/ResponseApi';
import { MSG_ERROR_DEFAULT } from '../../utilities/defaultValue';

interface IQuery extends IQuerystringJwt { // Interfaccia per la querystring della request
  page: number;
  limit: number;
}

export default async (server: FastifyInstance, options: FastifyPluginOptions) => {
  /*
  REST API per recuperare la lista degli utenti
  Codici di errore:
   */
  server.get<{
    Querystring: IQuery
  }>('/', {
    constraints: {
      version: '1.0.0' // Header Accept-Version
    },
    onRequest: server.verifyAuth // Verifica il token jwt restituito all'attod della login
  }, async (request, reply) => {
    try {
      const tokenData = await server.getDataFromToken(request.query.token);
      if (tokenData == null)
        return new ResponseApi(null, false, MSG_ERROR_DEFAULT, 2);
      const permesso = await server.verificaPermessi(tokenData.id, 'readUtenti');
      if (!permesso)
        return new ResponseApi(null, false, 'Accesso non autorizzato', 3);
      const utenti: IUtenti[] = await utentiSchema.find({}, {
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
      return new ResponseApi(null, false, MSG_ERROR_DEFAULT, 3);
    }
  });
};
