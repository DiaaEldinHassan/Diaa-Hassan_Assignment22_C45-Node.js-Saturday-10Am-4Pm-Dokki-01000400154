import { Inject, Injectable } from '@nestjs/common';
import nodemailer, { type Transporter } from 'nodemailer';
import { env } from '../../config';
import { MAIL_TRANSPORTER } from './mail.constants';

@Injectable()
export class EmailService {
  constructor(
    @Inject(MAIL_TRANSPORTER) private readonly transporter: Transporter,
  ) {}

  async sendVerificationEmail(to: string, otp: string): Promise<void> {
    try {
      const fromEmail = env.email_user || 'noreply@ecommerce.local';
      const info = await this.transporter.sendMail({
        from: `"E-Commerce" <${fromEmail}>`,
        to,
        subject: 'Confirm Your Email Address',
        html: `
          <h1>Email Confirmation</h1>
          <p>Thank you for signing up! Use the OTP below to confirm your email:</p>
          <div style="text-align:center;margin:30px 0;padding:20px;background:#f4f4f4;border-radius:8px;font-size:32px;letter-spacing:8px;font-weight:bold;">${otp}</div>
          <p>This OTP will expire in 24 hours.</p>
          <p>If you did not create an account, please ignore this email.</p>
        `,
      });

    } catch (error) {
      console.error('Mail: Error sending verification email to', to, error);
    }
  }

  async sendPasswordResetEmail(to: string, otp: string): Promise<void> {
    try {
      const fromEmail = env.email_user || 'noreply@ecommerce.local';
      const info = await this.transporter.sendMail({
        from: `"E-Commerce" <${fromEmail}>`,
        to,
        subject: 'Reset Your Password',
        html: `
          <h1>Password Reset</h1>
          <p>You requested a password reset. Use the OTP below to set a new password:</p>
          <div style="text-align:center;margin:30px 0;padding:20px;background:#f4f4f4;border-radius:8px;font-size:32px;letter-spacing:8px;font-weight:bold;">${otp}</div>
          <p>This OTP will expire in 1 hour.</p>
          <p>If you did not request a password reset, please ignore this email.</p>
        `,
      });

    } catch (error) {
      console.error('Mail: Error sending password reset email to', to, error);
    }
  }
}
