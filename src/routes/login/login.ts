import { FastifyInstance, FastifyPluginOptions, FastifyRequest, FastifyReply } from 'fastify';
import utentiSchema from '../../entities/utenti/utenti.schema';
import IUtenti from '../../entities/utenti/utenti.interface';
import { MSG_ERROR_DEFAULT } from '../../utilities/defaultValue';
import { ResponseApi } from '../../models/ResponseApi';
import { compare } from 'bcryptjs';
import { bodyLogin } from '../../schemas/validations/login.validation';
import { responseLogin } from '../../schemas/serializations/login.serialization';

interface IBody {
  email: string;
  password: string;
}

export default async (server: FastifyInstance, options: FastifyPluginOptions) => {
  /*
  REST API per effettuare la login
  1 - Errore generico
  2 - Utente non trovato
  3 - Password errata
   */
  server.post('/', {
    constraints: {
      version: '1.0.0'
    },
    schema: {
      body: bodyLogin,
      response: {
        200: responseLogin
      }
    }
  }, async (request: FastifyRequest<{ Body: IBody }>, reply: FastifyReply): Promise<ResponseApi> => {
    try {
      const { email, password } = request.body;
      const utente: IUtenti | null = await utentiSchema.findOne({ username: email });
      if (utente == null)
        return new ResponseApi(null, false, 'Username o password non corretti', 2);
      const pwdIsCorrect: boolean = await compare(password, utente.password);
      if (!pwdIsCorrect)
        return new ResponseApi(null, false, 'Username o password non corretti', 3);
      const signIn = server.signAuth(request, {
        id: utente._id
      });
      return new ResponseApi({
        auth: signIn
      });
    } catch (ex) {
      server.log.error(ex);
      return new ResponseApi(null, false, MSG_ERROR_DEFAULT, 1);
    }
  });
};

declare module "jsonwebtoken" {
  export interface JwtPayload {
    id: string;
  }
}
