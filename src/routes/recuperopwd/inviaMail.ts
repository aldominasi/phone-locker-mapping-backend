import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { ResponseApi } from '../../models/ResponseApi';
import utentiSchema from '../../entities/utenti/utenti.schema';
import { MSG_ERROR_DEFAULT } from '../../utilities/defaultValue';
import ResponseApiSerialization from '../../schemas/serializations/responseApi.serialization';
import S from 'fluent-json-schema';

enum Errore {
  GENERICO = 'ERR_MAIL_PWD_1',
  UTENTE_NON_TROVATO = 'ERR_MAIL_PWD_2'
}

interface IBodySendMail {
  email: string;
}

export default async (server: FastifyInstance, options: FastifyPluginOptions) => {
  /*
  REST API per inviare la mail di recupero password
  Codici di errore:
  ERR_MAIL_PWD_1 - Errore generico
  ERR_MAIL_PWD_2 - Utente non trovato
   */
  server.post<{
    Body: IBodySendMail
  }>('/', {
    constraints: {
      version: '1.0.0' // Header Accept-Version
    },
    schema: {
      body: S.object().prop('email', S.string().required().format(S.FORMATS.EMAIL)),
      response: {
        '200': ResponseApiSerialization.prop('data', S.string()).raw({ nullable: true })
      }
    }
  }, async (request, reply) => {
    try {
      const utente = await utentiSchema.findOne({ email: request.body.email }); // Cerca l'utente con l'email presente nel payload della richiesta
      if (utente == null)
        return new ResponseApi(null, false, 'Si è verificato un errore. Riprova più tardi', Errore.UTENTE_NON_TROVATO);
      const tokenUtente = await server.signAuth({ id: utente._id.toString() }, 1200); // Firma il token per 20 minuti
      await server.mailer.sendMail({ // Invia una mail contenente l'url per modificare la password
        from: 'aldo.minasi@gmail.com',
        to: request.body.email,
        subject: 'Recupero Password Plm',
        html: `Vai al seguente link per modificare la password <a href="${process.env.HOST_PLM}/plm/#/pwdLost?tkn=${tokenUtente}">${process.env.HOST_PLM}</a>`
      });
      return new ResponseApi('A breve riceverai una mail contenente le informazioni per recuperare la password.');
    } catch (ex) {
      server.log.error(ex);
      return new ResponseApi(null, false, MSG_ERROR_DEFAULT, Errore.GENERICO);
    }
  });
};
