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
  1 - Errore generico
  2 - Token non valido o scaduto
  3 - Errore nel recupero delle informazioni presenti nel token
  4 - L'utente non ha il permesso di accedere all'API
  5 - Il ruolo presente nel payload della richiesta non è valido
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
      const tokenData = await server.getDataFromToken(request.query.token); // Recupero le info presenti nel token
      if (tokenData == null)
        return new ResponseApi(null, false, MSG_ERROR_DEFAULT, 3);
      const permesso = await server.verificaPermessi(tokenData.id, 'writeUtenti'); // Controllo i permessi dell'utente
      if (!permesso)
        return new ResponseApi(null, false, "Accesso non autorizzato", 4);
      const ruoloDaAssegnare: IRuoli | null = await ruoliSchema.findById(request.body.ruolo).exec(); // Controllo che il ruolo inviato sia valido
      if (ruoloDaAssegnare == null)
        return new ResponseApi(null, false, MSG_ERROR_DEFAULT, 5);
      const pwd: string = server.createPwd(6, true, false); // Genera in maniera pseudo-casuale la password da inviare per email
      request.body.password = await hash(pwd, parseInt(process.env.SALT_PWD ?? '8')); // Esegue l'encrypt della password per salvare nel db
      const utente: IUtenti = {
        ...request.body,
        ruolo: request.body.ruolo
      };
      const utenteCreato = await utentiSchema.create(utente); // Crea l'utente
      await server.mailer.sendMail({ // Invia l'email di avvenuta registrazione all'indirizzo email presente nel payload della richiesta
        to: utenteCreato.email,
        subject: 'Nuovo account Plm',
        text: `E' stato creato un nuovo account. La tua password per accedere ai servizi Plm è ${pwd}\nTi invitiamo a cambiarla`
      });
      return new ResponseApi(utenteCreato); // Risposta inviata al client
    } catch (ex) {
      server.log.error(ex);
      return new ResponseApi(null, false, MSG_ERROR_DEFAULT, 1);
    }
  });
};
