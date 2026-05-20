import { Module, Global } from '@nestjs/common';
import nodemailer from 'nodemailer';
import { env } from '../../config';
import { EmailService } from './email.service';
import { MAIL_TRANSPORTER } from './mail.constants';

@Global()
@Module({
  providers: [
    {
      provide: MAIL_TRANSPORTER,
      useFactory: async () => {
        try {
          const transporter = nodemailer.createTransport({
            host: env.email_host,
            port: env.email_port,
            secure: env.email_port === 465,
            auth: {
              user: env.email_user,
              pass: env.email_pass,
            },
          });
          await transporter.verify();
          return transporter;
        } catch {
          console.warn('Mail: Gmail SMTP unavailable — trying Ethereal fallback...');
          try {
            const testAccount = await nodemailer.createTestAccount();
            const transporter = nodemailer.createTransport({
              host: 'smtp.ethereal.email',
              port: 587,
              secure: false,
              auth: {
                user: testAccount.user,
                pass: testAccount.pass,
              },
            });
            console.warn(
              `Mail: using ethereal email (${testAccount.user}) — check https://ethereal.email/messages`,
            );
            return transporter;
          } catch {
            console.warn('Mail: Ethereal fallback also failed — using jsonTransport (logs only)');
            return nodemailer.createTransport({ jsonTransport: true }) as any;
          }
        }
      },
    },
    EmailService,
  ],
  exports: [MAIL_TRANSPORTER, EmailService],
})
export class MailModule {}
