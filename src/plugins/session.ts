import fp from 'fastify-plugin';
import {FastifyInstance, FastifyPluginAsync, FastifyReply, FastifyRequest} from 'fastify';
import MongoStore from 'connect-mongo';
import fastifySession from '@fastify/session';
import { ResponseApi } from '../models/ResponseApi';
import {sign, verify, JwtPayload, decode } from 'jsonwebtoken';
import {type} from "os";

const keySession: string = process.env.KEY_SESSION as string;
const seedJwt: string = process.env.SEED_JWT_TOKEN as string;
const mongoConnection: string = process.env.DEVELOPMENT ? 'mongodb://127.0.0.1:27017/plmdb' : `mongodb://${process.env.DB_USER}:${process.env.DB_PWD}@${process.env.MONGO_DB_HOST}/${process.env.DB_NAME}?authSource=admin`;

const session: FastifyPluginAsync = async function (server: FastifyInstance) {
  try {
    server.register(fastifySession, {
      cookieName: 'mycuptCookie',
      secret: keySession,
      cookie: {
        secure: false,
        maxAge: 900000
      }, //TODO: in produzione utilizzare il valore true
      saveUninitialized: false,
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
    if (!request.session.authenticated)
      return reply.status(200).send(new ResponseApi(null, false, 'Accesso non consentito', 1));
    const resultVerify: string | JwtPayload = verify(request.session.token, seedJwt, {
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
    request.session.authenticated = true;
    request.session.token = token;
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
    return decode(request.session.token) as null | JwtPayload;
  } catch (ex) {
    console.error(ex);
    return null;
  }
}

declare module "fastify" {
  export interface Session {
    token: string;
    authenticated: boolean;
  }
  export interface FastifyInstance {
    signAuth: (request: FastifyRequest, data: JwtPayload) => boolean;
    verifyAuth: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    getDataFromToken: (request: FastifyRequest) => null | JwtPayload;
  }
}

export default fp(session);
