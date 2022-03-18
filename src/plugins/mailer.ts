import fp from 'fastify-plugin';
import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { Transporter } from 'nodemailer';

export interface FastifyMailerNamedInstance {
  [namespace: string]: Transporter;
}
export type FastifyMailer = FastifyMailerNamedInstance & Transporter;

export default fp(async (server: FastifyInstance, options: FastifyPluginOptions) => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    server.register(require('fastify-mailer'), {
      defaults: { from: 'assistenza plm <assistenza@plm.tld>' },
      transport: {
        host: 'smtp.mailtrap.io',
        port: 2525,
        auth: {
          user: 'd93b5c35920087',
          pass: '981bd7d195239c'
        }
      }
    });
  } catch (ex) {
    server.log.error(ex);
  }
});

declare module "fastify" {
  interface FastifyInstance {
    mailer: FastifyMailer;
  }
}
