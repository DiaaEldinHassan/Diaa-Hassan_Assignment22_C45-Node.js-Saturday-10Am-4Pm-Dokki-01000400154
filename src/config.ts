import * as dotenv from 'dotenv';
import * as path from 'path';

const envPath = path.resolve(
  process.cwd(),
  'src',
  process.env.NODE_ENV === 'production' ? '.env.prod' : '.env.dev',
);
dotenv.config({ path: envPath });

export const env = {
  port: process.env.PORT,
  db_uri: process.env.DB_URI ?? 'mongodb://localhost:27017/ecommerce',
  salt: Number(process.env.SALT) || 10,
  access_sk: process.env.ACCESS_SECRET_KEY ?? 'access-secret-key',
  refresh_sk: process.env.REFRESH_SECRET_KEY ?? 'refresh-secret-key',
  encryption_sk:
    process.env.ENCRYPTION_SK ?? '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
  google_client_id: process.env.GOOGLE_CLIENT_ID ?? '',
  email_user: process.env.EMAIL_USER ?? '',
  email_pass: process.env.EMAIL_PASS ?? '',
  email_host: process.env.EMAIL_HOST ?? 'smtp.gmail.com',
  email_port: Number(process.env.EMAIL_PORT) || 587,
  client_url: process.env.CLIENT_URL ?? 'http://localhost:3000',
  s3_region: process.env.S3_REGION ?? '',
  s3_bucket_name: process.env.S3_BUCKET_NAME ?? '',
  s3_access_key: process.env.S3_ACCESS_KEY ?? '',
  s3_secret_access_key: process.env.S3_SECRET_ACCESS_KEY ?? '',
  s3_expiration_time: Number(process.env.S3_EXPIRATION_TIME) || 120,
};
