import { FastifyInstance, FastifyPluginOptions, FastifyRequest, FastifyReply } from 'fastify';
import armadiSchema from '../../entities/armadi/armadi.schema';
import IArmadi from '../../entities/armadi/armadi.interface';
import { ResponseApi } from '../../models/ResponseApi';

interface IParams {
  id: string
}

export default async (server: FastifyInstance, options: FastifyPluginOptions) => {
  /*
  REST API per recuperare le informazioni dell'armadio
  Codici di errore:
  1 - Armadio non trovato
  2 - Errore generico
   */
  server.get('/:id', async (request: FastifyRequest<{ Params: IParams }>, reply: FastifyReply) => {
    try {
      const armadio: IArmadi | null = await armadiSchema.findById(request.params.id);
      if (armadio == null) {
        return new ResponseApi(null, false, 'Armadio non trovato', 1);
      }
      return new ResponseApi(armadio);
    } catch (ex) {
      server.log.error(ex);
      return new ResponseApi(null, false, 'Si è verificato un errore. Riprova più tardi.', 2);
    }
  });
};

