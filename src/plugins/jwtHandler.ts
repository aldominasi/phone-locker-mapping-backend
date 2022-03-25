import fp from 'fastify-plugin';
import {FastifyInstance, FastifyPluginAsync, FastifyReply, FastifyRequest} from 'fastify';
import { ResponseApi } from '../models/ResponseApi';
import {sign, verify, JwtPayload, decode } from 'jsonwebtoken';

interface CustomJwtPayload extends JwtPayload {
  id: string;
}

export interface IQuerystringJwt {
  token: string;
}

const seedJwt: string = process.env.SEED_JWT_TOKEN as string;
enum Errore {
  JWT_ERR = 'ERR_JWT_1'
}

const jwtHandler: FastifyPluginAsync = async function (server: FastifyInstance) {
  try {
    server.decorate('verifyAuth', verifyAuth);
    server.decorate('signAuth', signAuth);
    server.decorate('getDataFromToken', getDataFromToken);
  } catch (ex) {
    server.log.error(ex);
  }
};

/**
 * Handler for hooks of fastify jwt verify
 * @param request FastifyInstance<{ Querystring: IQuerystringJwt }>
 * @param reply FastifyReply
 */

async function verifyAuth (request: FastifyRequest<{ Querystring: IQuerystringJwt }>, reply: FastifyReply): Promise<void> {
  try {
    verify(request.query.token, seedJwt, {
      ignoreExpiration: false
    });
  } catch (ex) {
    console.error(ex);
    return reply.status(200).send(new ResponseApi(null, false, 'Il servizio non è al momento disponibile', Errore.JWT_ERR));
  }
}

/**
 * Esegue la firma del token jwt. La funzione restituisce il token o null in caso di errore.
 * @param data Informazioni da includere nel token jwt
 * @param expire
 */

function signAuth(data: JwtPayload, expire: number | undefined = undefined): string | null {
  try {
    return expire == undefined ? sign(data, process.env.SEED_JWT_TOKEN as string) :
      sign(data, process.env.SEED_JWT_TOKEN as string, { expiresIn: expire });
  } catch (ex) {
    console.error(ex);
    return null;
  }
}

/**
 * Recupera i dati dal token jwt presente in sessione
 * @param jwt string JWT token
 */
function getDataFromToken(jwt: string): null | CustomJwtPayload {
  try {
    return decode(jwt) as null | CustomJwtPayload;
  } catch (ex) {
    console.error(ex);
    return null;
  }
}

declare module "fastify" {
  export interface FastifyInstance {
    signAuth: (data: CustomJwtPayload, expire?: number) => string | null;
    verifyAuth: (request: FastifyRequest<{ Querystring: IQuerystringJwt }>, reply: FastifyReply) => Promise<void>;
    getDataFromToken: (jwt: string) => null | CustomJwtPayload;
  }
}

export default fp(jwtHandler);
