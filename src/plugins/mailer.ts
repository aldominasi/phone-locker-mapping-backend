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
        service: '"SendGrid"',
        //host: 'smtp.mailtrap.io',
        //port: 2525,
        auth: {
          user: 'apikey',
          pass: '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'
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
