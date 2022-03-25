import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { MSG_ERROR_DEFAULT } from '../../utilities/defaultValue';
import { ResponseApi } from '../../models/ResponseApi';
import { IQuerystringJwt } from '../../plugins/jwtHandler';
import { bodyVal, queryVal } from '../../schemas/validations/modificaPwd.validation';
import modificaPwdSerialization from '../../schemas/serializations/modificaPwd.serialization';
import IUtenti from '../../entities/utenti/utenti.interface';
import utentiSchema from '../../entities/utenti/utenti.schema';
import { hash, compare } from 'bcryptjs';
import { DateTime } from 'luxon';

enum Errore {
  GENERICO = 'ERR_MOD_PWD_1',
  INFO_UTENTE = 'ERR_MOD_PWD_2',
  UTENTE_NON_TROVATO = 'ERR_MOD_PWD_3',
  PWD_ERRATA = 'ERR_MOD_PWD_4'
}

interface IBody {
  oldPwd: string;
  newPwd: string;
}

export default async (server: FastifyInstance, options: FastifyPluginOptions) => {
  /*
  REST API per modificare la password conoscendo quella corrente
  Codici di errore:
  ERR_MOD_PWD_1 - Errore generico
  ERR_MOD_PWD_2 - Errore nel recupero delle informazioni presenti nel token
  ERR_MOD_PWD_3 - Utente non trovato
  ERR_MOD_PWD_4 - La password corrente non è corretta
   */
  server.post<{
    Querystring: IQuerystringJwt,
    Body: IBody
  }>('/', {
    constraints: {
      version: '1.0.0'
    },
    schema: {
      querystring: queryVal,
      body: bodyVal,
      response: {
        '200': modificaPwdSerialization
      }
    },
    preHandler: server.verifyAuth
  }, async (request, reply): Promise<ResponseApi> => {
    try {
      const tokenData = await server.getDataFromToken(request.query.token);
      if (tokenData == null)
        return new ResponseApi(null, false, MSG_ERROR_DEFAULT, Errore.INFO_UTENTE);
      const utente: IUtenti | null = await utentiSchema.findById(tokenData.id).exec(); // Recupera l'utenza
      if (utente == null)
        return new ResponseApi(null, false, MSG_ERROR_DEFAULT, Errore.INFO_UTENTE);
      if (!(await compare(request.body.oldPwd, utente.password)))
        return new ResponseApi(null, false, 'I dati non sono corretti', Errore.PWD_ERRATA);
      const nuovaPassword: string = await hash(request.body.newPwd, parseInt(process.env.SALT_PWD as string));
      await utentiSchema.findByIdAndUpdate(tokenData.id, {
        $set: {
          password: nuovaPassword,
          modPwdData: DateTime.local().toJSDate()
        }
      }).exec();
      return new ResponseApi('La password è stata modificata correttamente');
    } catch (ex) {
      server.log.error(ex);
      return new ResponseApi(null, false, MSG_ERROR_DEFAULT, Errore.GENERICO);
    }
  });
};
