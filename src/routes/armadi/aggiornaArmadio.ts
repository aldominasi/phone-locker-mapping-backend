import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import armadiSchema from '../../entities/armadi/armadi.schema';
import IArmadi from '../../entities/armadi/armadi.interface';
import { IQuerystringJwt } from '../../plugins/jwtHandler';
import { ResponseApi} from '../../models/ResponseApi';
import { MSG_ERROR_DEFAULT } from '../../utilities/defaultValue';
import { UpdateQuery } from 'mongoose';
import { paramsVal, bodyPatchVal } from '../../schemas/validations/aggiornaArmadio.validation';
import { patchSerialization } from '../../schemas/serializations/aggiornaArmadio.serialization';

const regexFieldPatchNoProtected = /(nota)|(coordinates)/;
enum ErrorePatch {
  GENERICO = 'ERR_PATCH_ARM_1',
  INFO_UTENTE = 'ERR_PATCH_ARM_2',
  PERMESSI = 'ERR_PATCH_ARM_3',
  ARMADIO_NON_TROVATO = 'ERR_PATCH_ARM_4',
  OPERAZIONE_NON_VALIDA = 'ERR_PATCH_ARM_5',
  OPERAZIONE_NON_RIUSCITA = 'ERR_PATCH_ARM_6',
}

enum OperationsPatch {
  REPLACE = 'replace'
}

interface IParams {
  id: string;
}

interface IBodyPatch {
  operation: OperationsPatch;
  path: string;
  value: string;
}

export default async (server: FastifyInstance, options: FastifyPluginOptions) => {
  /*
  REST API per eseguire l'update di specifici campi di un armadio
  Codici di errore:
  ERR_PATCH_ARM_1 - Errore generico
  ERR_PATCH_ARM_2 - Errore nel recupero delle informazioni presenti nel token
  ERR_PATCH_ARM_3 - L'utente non ha il permesso di accedere all'API
  ERR_PATCH_ARM_4 - Armadio non trovato
  ERR_PATCH_ARM_5 - Operazione non valida sul path
  ERR_PATCH_ARM_6 - Operazione non riuscita
   */
  server.patch<{
    Params: IParams,
    Querystring: IQuerystringJwt,
    Body: IBodyPatch[]
  }>('/:id', {
    constraints: {
      version: '1.0.0'
    },
    schema: {
      params: paramsVal,
      body: bodyPatchVal,
      response: {
        '200': patchSerialization
      }
    },
    onRequest: async (request, reply) => {
      if (request.headers['content-type'] !== 'application/json-patch+json')
        return reply.code(415).send('La richiesta non può essere elaborata');
    },
    preHandler: [ server.verifyAuth, server.verificaPwdScaduta] // Verifica la sessione dell'utente e la scadenza della sua pwd
  }, async (request, reply) => {
    try {
      const tokenData = await server.getDataFromToken(request.query.token);
      if (tokenData == null)
        return new ResponseApi(null, false, MSG_ERROR_DEFAULT, ErrorePatch.INFO_UTENTE);
      /*
      Ciclo su tutte le operazioni. Nel caso trovo un'operazione che coinvolge
      campi protetti da scrittura verifico i permessi dell'utente
       */
      for (let i = 0; i < request.body.length; i++) {
        if (!regexFieldPatchNoProtected.test(request.body[i].path)) {
          if (!(await server.verificaPermessi(tokenData.id, 'writeArmadi')))
            return new ResponseApi(null, false, 'Accesso non autorizzato', ErrorePatch.PERMESSI);
          else
            break;
        }
      }
      // Eseguo le operazioni
      const query: UpdateQuery<IArmadi> = {};
      query.$set= {};
      for(let i = 0; i < request.body.length; i++) {
        switch (request.body[i].operation) {
          case OperationsPatch.REPLACE: // Operazione valida solo aggiungere in un array
            query.$set[request.body[i].path] = request.body[i].value;
            break;
          default:
            return new ResponseApi(null, false, 'Operazione non riuscita. Riprova più tardi', ErrorePatch.OPERAZIONE_NON_VALIDA);
        }
      }
      const result = await armadiSchema.findByIdAndUpdate(request.params.id, query, { new: true }).exec();
      if (result == null) // Il salvataggio delle modifiche è fallito
        return new ResponseApi(null, false, 'Operazione non riuscita. Riprova più tardi.', ErrorePatch.OPERAZIONE_NON_RIUSCITA);
      return new ResponseApi(result);
    } catch (ex) {
      server.log.error(ex);
      return new ResponseApi(null, false, MSG_ERROR_DEFAULT, ErrorePatch.GENERICO);
    }
  });
};
