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
  REST API per effettuare l'accesso alle funzionalità messe a disposizione dalla piattaforma'
  Codici di errore:
  1 - Errore generico
  2 - Utente non trovato (l'email non è presente nel db)
  3 - La password inserita dall'utente non è corretta
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
      const signIn = server.signAuth({ // Firma del JWT contenente l'id dell'utente
        id: utente._id.toString()
      }, 3600); // expire in 1 hour
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
