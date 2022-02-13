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
      await mongoose.connect('mongodb://127.0.0.1:27017/plmdb', {
        autoIndex: true
      });
    }
    else {
      await mongoose.connect(`mongodb://${process.env.DB_USER}:${process.env.DB_PWD}@mongo:27017/${process.env.DB_NAME}`, {
        autoIndex: true
      });
    }
  } catch (ex) {
    server.log.error(ex);
  }
};

export default fp(connectToDb);
