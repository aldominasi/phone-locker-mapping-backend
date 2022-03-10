//Decorate che verifica i permessi dell'utente

import fp from 'fastify-plugin';
import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import IUtenti, { IPermessi } from '../entities/utenti/utenti.interface';
import utentiSchema from '../entities/utenti/utenti.schema';

export default fp(async (server: FastifyInstance, options: FastifyPluginOptions) => {
  server.decorate('verificaPermessi', async (idUtente: string, operazione: keyof IPermessi): Promise<boolean> => {
    try {
      const user: IUtenti | null = await utentiSchema.findById(idUtente).exec();
      if (user == null)
        return false;
      return !(user == null || !user.permessi[operazione]);
    } catch(ex) {
      server.log.error(ex);
      return false;
    }
  });
});

declare module "fastify" {
  export interface FastifyInstance {
    verificaPermessi: (idUtente: string, operazione: keyof IPermessi) => Promise<boolean>;
  }
}
