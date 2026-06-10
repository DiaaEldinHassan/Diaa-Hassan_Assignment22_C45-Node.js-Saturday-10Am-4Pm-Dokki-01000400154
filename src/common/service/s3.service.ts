import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { env } from '../../config';

@Injectable()
export class S3Service {
  private readonly s3: S3Client;

  constructor() {
    this.s3 = new S3Client({
      region: env.s3_region,
      credentials: {
        accessKeyId: env.s3_access_key,
        secretAccessKey: env.s3_secret_access_key,
      },
    });
  }

  async uploadFile(
    buffer: Buffer,
    key: string,
    mimetype: string,
  ): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: env.s3_bucket_name,
      Key: key,
      Body: buffer,
      ContentType: mimetype,
    });

    await this.s3.send(command);

    return `https://${env.s3_bucket_name}.s3.${env.s3_region}.amazonaws.com/${key}`;
  }

  async deleteFile(key: string): Promise<void> {
    const { DeleteObjectCommand } = await import('@aws-sdk/client-s3');
    const command = new DeleteObjectCommand({
      Bucket: env.s3_bucket_name,
      Key: key,
    });
    await this.s3.send(command);
  }
}
