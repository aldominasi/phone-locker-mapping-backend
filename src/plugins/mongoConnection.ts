import fp from 'fastify-plugin';
import mongoose from 'mongoose';
import { FastifyInstance, FastifyPluginAsync } from 'fastify';

const connectToDb: FastifyPluginAsync = async function (server: FastifyInstance) {
  try {
    mongoose.connection.on('connected', () => {
      server.log.info('Connessione al db riuscita');
    });
    mongoose.connection.on('disconnected',  () => {
      server.log.error('connessione al db persa');
    });
    // TODO: CREARE UNA VARIABILE D'AMBIENTE PER LA CONNECTION STRING AL DB
    await mongoose.connect('mongodb://127.0.0.1:27017/plmdb', {
      autoIndex: true
    });
  } catch (ex) {
    server.log.error(ex);
  }
};

export default fp(connectToDb);
