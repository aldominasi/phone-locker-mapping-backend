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
    if (process.env.DEVELOPMENT) {
      await mongoose.connect(`mongodb://${process.env.HOST_DB}/${process.env.MONGO_INITDB_DATABASE}`, {
        autoIndex: true
      });
    }
    else {
      await mongoose.connect(`mongodb://${process.env.MONGO_INITDB_ROOT_USERNAME}:${process.env.MONGO_INITDB_ROOT_PASSWORD}@${process.env.HOST_DB}/${process.env.MONGO_INITDB_DATABASE}?authSource=${process.env.MONGO_INITDB_DATABASE}`, {
        autoIndex: true
      });
    }
  } catch (ex) {
    server.log.error(ex);
  }
};

export default fp(connectToDb);
