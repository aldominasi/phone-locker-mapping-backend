//Decorate che verifica i permessi dell'utente
import fp from 'fastify-plugin';
import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import IUtenti from '../entities/utenti/utenti.interface';
import utentiSchema from '../entities/utenti/utenti.schema';
import { IRuoli, IPermessi } from '../entities/ruoli/ruoli.interface';
import ruoliSchema from '../entities/ruoli/ruoli.schema';

export default fp(async (server: FastifyInstance, options: FastifyPluginOptions) => {
  server.decorate('verificaPermessi', async (idUtente: string, operazione: keyof IPermessi): Promise<boolean> => {
    try {
      const user: IUtenti | null = await utentiSchema.findById(idUtente).exec();
      if (user == null)
        return false;
      const ruolo: IRuoli | null = await ruoliSchema.findById(user.ruolo).exec();
      if (ruolo == null)
        return false;
      return ruolo.permessi[operazione];
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
