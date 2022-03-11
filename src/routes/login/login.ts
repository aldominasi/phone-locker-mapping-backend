import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import utentiSchema from '../../entities/utenti/utenti.schema';
import { MSG_ERROR_DEFAULT } from '../../utilities/defaultValue';
import { ResponseApi } from '../../models/ResponseApi';
import { compare } from 'bcryptjs';
import { bodyLogin } from '../../schemas/validations/login.validation';
import { responseLogin } from '../../schemas/serializations/login.serialization';

// Body della request per eseguire la login
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
  server.post<{
    Body: IBody
  }>('/', {
    constraints: {
      version: '1.0.0'
    },
    schema: {
      body: bodyLogin, // Validazione del body
      response: {
        200: responseLogin // Serializzazione della risposta
      }
    }
  }, async (request, reply): Promise<ResponseApi> => {
    try {
      const { email, password } = request.body; //Recupero l'email e la password inviate dal client
      const utente = await utentiSchema.findOne({ email: email }).exec(); // Cerco l'utente utilizzando i dati ricevuti dal client
      if (utente == null) // Utente non trovato
        return new ResponseApi(null, false, 'Username o password non corretti', 2);
      const pwdIsCorrect: boolean = await compare(password, utente.password); // controllo se la password è corretta
      if (!pwdIsCorrect) // Password non corretta
        return new ResponseApi(null, false, 'Username o password non corretti', 3);
      const signIn = server.signAuth(request, { // Firma del JWT contenente l'id dell'utente
        id: utente._id.toString()
      });
      return new ResponseApi({ // Response del server
        auth: signIn != null,
        token: signIn
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
