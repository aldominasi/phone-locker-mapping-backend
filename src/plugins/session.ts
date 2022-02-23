import fp from 'fastify-plugin';
import {FastifyInstance, FastifyPluginAsync, FastifyReply, FastifyRequest} from 'fastify';
import MongoStore from 'connect-mongo';
import fastifySession from 'fastify-session';
import { ResponseApi } from '../models/ResponseApi';
import {sign, verify, JwtPayload, decode } from 'jsonwebtoken';
import fastifyCookie from 'fastify-cookie';

const keySession: string = process.env.KEY_SESSION as string;
const seedJwt: string = process.env.SEED_JWT_TOKEN as string;
const mongoConnection: string = process.env.DEVELOPMENT ? 'mongodb://127.0.0.1:27017/plmdb' : `mongodb://${process.env.DB_USER}:${process.env.DB_PWD}@${process.env.MONGO_DB_HOST}/${process.env.DB_NAME}?authSource=admin`;

const session: FastifyPluginAsync = async function (server: FastifyInstance) {
  try {
    server.register(fastifyCookie);
    server.register(fastifySession, {
      cookieName: 'mycuptCookie',
      secret: keySession,
      cookie: {
        secure: false, //TODO: in produzione utilizzare il valore true
        maxAge: 900000
      },
      saveUninitialized: true,
      store: new MongoStore({
        mongoUrl: mongoConnection,
      })
    });
    server.decorate('verifyAuth', verifyAuth);
    server.decorate('signAuth', signAuth);
    server.decorate('getDataFromToken', getDataFromToken);
  } catch (ex) {
    server.log.error(ex);
  }
};

/**
 * Handler for hooks of fastify session verify
 * @param request FastifyInstance
 * @param reply FastifyReply
 */

async function verifyAuth (request: FastifyRequest, reply: FastifyReply): Promise<void> {
  try {
    if (!request.session.user.authenticated)
      return reply.status(200).send(new ResponseApi(null, false, 'Accesso non consentito', 1));
    verify(request.session.user.token, seedJwt, {
      ignoreExpiration: false
    });
  } catch (ex) {
    console.error(ex);
    return reply.status(200).send(new ResponseApi(null, false, 'Il servio non è al momento disponibile', 2));
  }
}

function signAuth(request: FastifyRequest, data: JwtPayload): boolean {
  try {
    const token: string = sign(data, process.env.SEED_JWT_TOKEN as string);
    request.session.user = {
      authenticated: true,
      token: token
    };
    return true;
  } catch (ex) {
    console.error(ex);
    return false;
  }
}

/**
 *
 * @param request FastifyRequest
 */
function getDataFromToken(request: FastifyRequest): null | JwtPayload {
  try {
    return decode(request.session.user.token) as null | JwtPayload;
  } catch (ex) {
    console.error(ex);
    return null;
  }
}

declare module "fastify-session" {
  export interface Session {
    user: {
      authenticated: boolean;
      token: string;
    }
  }
}

declare module "fastify" {
  export interface FastifyInstance {
    signAuth: (request: FastifyRequest, data: JwtPayload) => boolean;
    verifyAuth: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    getDataFromToken: (request: FastifyRequest) => null | JwtPayload;
  }
}

export default fp(session);
