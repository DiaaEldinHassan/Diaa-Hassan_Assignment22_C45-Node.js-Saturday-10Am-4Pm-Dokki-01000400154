import crypto from 'node:crypto';
import { env } from '../../config';

const alg = 'aes-256-cbc';
export const encrypt = (
  plainData: string,
): { iv: string; encryptedData: string } => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(alg, env.encryption_sk, iv);
  let encryptedData = cipher.update(plainData, 'utf-8', 'hex');
  encryptedData += cipher.final('hex');
  return {
    iv: iv.toString('hex'),
    encryptedData,
  };
};

export const decrypt = (
  data: { iv: string; encryptedData: string }[],
): string[] => {
  const decryptedArray: string[] = [];
  data.forEach((d) => {
    const iv = Buffer.from(d.iv, 'hex');
    const encryptedText = d.encryptedData;
    const decipher = crypto.createDecipheriv(alg, env.encryption_sk, iv);
    let decryptedData = decipher.update(encryptedText, 'hex', 'utf-8');
    decryptedData += decipher.final('utf-8');
    decryptedArray.push(decryptedData);
  });
  return decryptedArray;
};
