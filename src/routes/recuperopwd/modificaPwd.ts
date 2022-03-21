import { FastifyInstance, FastifyPluginOptions, FastifyRequest, FastifyReply } from 'fastify';
import { ResponseApi } from '../../models/ResponseApi';
import utentiSchema from '../../entities/utenti/utenti.schema';
import IUtenti from '../../entities/utenti/utenti.interface';
import S from 'fluent-json-schema';
import ResponseApiSerialization from '../../schemas/serializations/responseApi.serialization';
import { MSG_ERROR_DEFAULT } from '../../utilities/defaultValue';
import { IQuerystringJwt } from '../../plugins/jwtHandler';
import { hash } from 'bcryptjs';
const regexPassword = /^((?=\S*?[A-Z])(?=\S*?[a-z])(?=\S*?[0-9]).{6,})\S$/;

interface IBodyModPwd {
  pwd: string;
}

export default async (server: FastifyInstance, options: FastifyPluginOptions) => {
  /*
  REST API per modificare la password dopo aver ricevuto la mail
  Codici di errore:

   */
  server.post<{
    Querystring: IQuerystringJwt,
    Body: IBodyModPwd
  }>('/modifica', {
    constraints: {
      version: '1.0.0' // Header Accept-Version
    },
    schema: {
      body: S.object().prop('pwd', S.string().pattern(regexPassword).required()),
      response: {
        '200': ResponseApiSerialization.prop('data', S.string()).raw({ nullable: true })
      }
    },
    preHandler: server.verifyAuth // Verifica l'identità
  }, async (request, reply): Promise<ResponseApi> => {
    try {
      const tokenData = await server.getDataFromToken(request.query.token);
      if (tokenData == null)
        return new ResponseApi(null, false, MSG_ERROR_DEFAULT, 2);
      const utente: IUtenti | null = await utentiSchema.findById(tokenData.id).exec(); // Recupera l'utenza
      if (utente == null)
        return new ResponseApi(null, false, MSG_ERROR_DEFAULT, 4);
      const nuovaPassword: string = await hash(request.body.pwd, parseInt(process.env.SALT_PWD as string));
      await utentiSchema.findByIdAndUpdate(tokenData.id, {
        $set: { password: nuovaPassword }
      });
      return new ResponseApi('La password è stata modificata correttamente');
    } catch (ex) {
      server.log.error(ex);
      return new ResponseApi(null, false, MSG_ERROR_DEFAULT, 3);
    }
  });
};
