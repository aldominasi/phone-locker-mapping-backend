import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { ResponseApi } from '../../models/ResponseApi';
import utentiSchema from '../../entities/utenti/utenti.schema';
import IUtenti from '../../entities/utenti/utenti.interface';
import S from 'fluent-json-schema';
import ResponseApiSerialization from '../../schemas/serializations/responseApi.serialization';
import { MSG_ERROR_DEFAULT } from '../../utilities/defaultValue';
import { IQuerystringJwt } from '../../plugins/jwtHandler';
import { hash } from 'bcryptjs';
import { DateTime } from 'luxon';

const regexPassword = /^((?=\S*?[A-Z])(?=\S*?[a-z])(?=\S*?[0-9]).{6,})\S$/;

enum Errore {
  GENERICO = 'ERR_MOD_PWD_1',
  INFO_UTENTE = 'ERR_MOD_PWD_2',
  UTENTE_NON_TROVATO = 'ERR_MOD_PWD_3'
}

interface IBodyModPwd {
  pwd: string;
}

export default async (server: FastifyInstance, options: FastifyPluginOptions) => {
  /*
  REST API per modificare la password dopo aver ricevuto la mail
  Codici di errore:
  ERR_MOD_PWD_1 - Errore generico
  ERR_MOD_PWD_2 - Errore nel recupero delle informazioni presenti nel token
  ERR_MOD_PWD_3 - Utente non trovato
   */
  server.post<{
    Querystring: IQuerystringJwt,
    Body: IBodyModPwd
  }>('/modifica', {
    constraints: {
      version: '1.0.0' // Header Accept-Version
    },
    schema: {
      querystring: S.object().prop('token', S.string().required()),
      body: S.object().prop('pwd', S.string().pattern(regexPassword).required()),
      response: {
        '200': ResponseApiSerialization.prop('data', S.string()).raw({ nullable: true })
      }
    },
    preHandler: server.verifyAuth // Verifica l'identità
  }, async (request, reply): Promise<ResponseApi> => {
    try {
      const tokenData = await server.getDataFromToken(request.query.token); // Recupero le informazioni dal token
      if (tokenData == null)
        return new ResponseApi(null, false, MSG_ERROR_DEFAULT, Errore.INFO_UTENTE);
      const utente: IUtenti | null = await utentiSchema.findById(tokenData.id).exec(); // Recupera l'utenza
      if (utente == null)
        return new ResponseApi(null, false, MSG_ERROR_DEFAULT, Errore.UTENTE_NON_TROVATO);
      const nuovaPassword: string = await hash(request.body.pwd, parseInt(process.env.SALT_PWD as string)); // Eseguo l'hash della nuova password
      await utentiSchema.findByIdAndUpdate(tokenData.id, {
        $set: {
          password: nuovaPassword,
          modPwdData: DateTime.local().toJSDate()
        }
      }).exec(); // Eseguo l'update della password
      return new ResponseApi('La password è stata modificata correttamente');
    } catch (ex) {
      server.log.error(ex);
      return new ResponseApi(null, false, MSG_ERROR_DEFAULT, Errore.GENERICO);
    }
  });
};
