import { FastifyRequest, FastifyReply } from "fastify";
import { ResponseApi } from '../models/ResponseApi';

enum Errore {
  CREDENZIALI_ERRATE = 'ERR_AUTH_1'
}

export default {
  authenticate: { realm: 'Plm' },
  validate: async (username: string, password: string, request: FastifyRequest, reply: FastifyReply) => {
    if (username !== process.env.USERNAME_BASIC_AUTH && password !== process.env.PASSWORD_BASIC_AUTH)
      return reply.code(200).send(new ResponseApi(null, false, 'Accesso non autorizzato', Errore.CREDENZIALI_ERRATE));
  }
};
