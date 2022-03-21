import { FastifyInstance, FastifyPluginOptions, FastifyRequest, FastifyReply } from 'fastify';
import { ResponseApi } from '../../models/ResponseApi';
import utentiSchema from '../../entities/utenti/utenti.schema';
import { MSG_ERROR_DEFAULT } from '../../utilities/defaultValue';
import ResponseApiSerialization from '../../schemas/serializations/responseApi.serialization';
import S from 'fluent-json-schema';

interface IBodySendMail {
  email: string;
}

export default async (server: FastifyInstance, options: FastifyPluginOptions) => {
  /*
  REST API per inviare la mail di recupero password
  Codici di errore:

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
      const utente = await utentiSchema.findOne({ email: request.body.email });
      if (utente == null)
        return new ResponseApi(null, false, 'Qualcosa è andato storto. Riprova più tardi', 1);
      const tokenUtente = await server.signAuth({ // Firma del Jwt contenente l'id dell'utente
        id: utente._id.toString()
      });
      await server.mailer.sendMail({
        to: request.body.email,
        subject: 'Recupero Password Plm',
        html: `<p>Vai al seguente link per modificare la password <a href="${process.env.HOST_PLM}?tkn=${tokenUtente}">${process.env.HOST_PLM}</a></p>`
      });
      return new ResponseApi('A breve riceverai una mail contenente le informazioni per recuperare la password.');
    } catch (ex) {
      server.log.error(ex);
      return new ResponseApi(null, false, MSG_ERROR_DEFAULT, 3);
    }
  });
};
