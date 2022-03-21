import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import utentiSchema from '../../entities/utenti/utenti.schema';
import IUtenti from '../../entities/utenti/utenti.interface';
import { ResponseApi } from '../../models/ResponseApi';
import { MSG_ERROR_DEFAULT } from '../../utilities/defaultValue';
import { hash } from 'bcryptjs';
import { IQuerystringJwt } from '../../plugins/jwtHandler';
import { IRuoli } from '../../entities/ruoli/ruoli.interface';
import ruoliSchema from '../../entities/ruoli/ruoli.schema';
import { bodyVal, queryVal } from '../../schemas/validations/registraUtente.validation';
import serializeReply from '../../schemas/serializations/registraUtente.serialization';

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
    schema: {
      querystring: queryVal,
      body: bodyVal,
      response: {
        '201': serializeReply
      }
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
      const ruoloDaAssegnare: IRuoli | null = await ruoliSchema.findById(request.body.ruolo).exec();
      if (ruoloDaAssegnare == null)
        return new ResponseApi(null, false, MSG_ERROR_DEFAULT, 5);
      const pwd: string = server.createPwd(6, true, false);
      request.body.password = await hash(pwd, parseInt(process.env.SALT_PWD ?? '8')); // Esegue l'encrypt della password
      const utente: IUtenti = {
        ...request.body,
        ruolo: request.body.ruolo
      };
      const utenteCreato = await utentiSchema.create(utente); // Crea l'utente
      await server.mailer.sendMail({
        to: utenteCreato.email,
        subject: 'Nuovo account Plm',
        text: `E' stato creato un nuovo account. La tua password per accedere ai servizi Plm è ${pwd}\nTi invitiamo a cambiarla`
      });
      return new ResponseApi(utenteCreato); // Risposta inviata al client
    } catch (ex) {
      server.log.error(ex);
      return new ResponseApi(null, false, MSG_ERROR_DEFAULT, 3);
    }
  });
};
