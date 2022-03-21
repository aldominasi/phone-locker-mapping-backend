import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { MSG_ERROR_DEFAULT } from '../../utilities/defaultValue';
import { ResponseApi } from '../../models/ResponseApi';
import { IQuerystringJwt } from '../../plugins/jwtHandler';
import { bodyVal, queryVal } from '../../schemas/validations/modificaPwd.validation';
import modificaPwdSerialization from '../../schemas/serializations/modificaPwd.serialization';
import IUtenti from '../../entities/utenti/utenti.interface';
import utentiSchema from '../../entities/utenti/utenti.schema';
import { hash, compare } from 'bcryptjs';

interface IBody {
  oldPwd: string;
  newPwd: string;
}

export default async (server: FastifyInstance, options: FastifyPluginOptions) => {
  /*
  REST API per modificare la password conoscendo quella corrente
  Codici di errore:

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
        return new ResponseApi(null, false, MSG_ERROR_DEFAULT, 2);
      const utente: IUtenti | null = await utentiSchema.findById(tokenData.id).exec(); // Recupera l'utenza
      if (utente == null)
        return new ResponseApi(null, false, MSG_ERROR_DEFAULT, 4);
      if (!(await compare(request.body.oldPwd, utente.password)))
        return new ResponseApi(null, false, 'Accesso non verificato', 5);
      const nuovaPassword: string = await hash(request.body.newPwd, parseInt(process.env.SALT_PWD as string));
      await utentiSchema.findByIdAndUpdate(tokenData.id, {
        $set: { password: nuovaPassword }
      }).exec();
      return new ResponseApi('La password è stata modificata correttamente');
    } catch (ex) {
      server.log.error(ex);
      return new ResponseApi(null, false, MSG_ERROR_DEFAULT, 3);
    }
  });
};
