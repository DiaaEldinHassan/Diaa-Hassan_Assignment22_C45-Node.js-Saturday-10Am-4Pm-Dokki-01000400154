import { BadRequestError } from './error.utils';
import bcrypt from 'bcrypt';
import { env } from '../../config';

export const hashing = async (plainText: string): Promise<string> => {
  try {
    const hashedText = await bcrypt.hash(plainText, env.salt);
    return hashedText;
  } catch {
    throw new BadRequestError('Hash Function Error');
  }
};

export const compareHash = async (
  hashedText: string,
  plainText: string,
): Promise<boolean> => {
  try {
    return await bcrypt.compare(plainText, hashedText);
  } catch {
    throw new BadRequestError('Hash Compare Function Error');
  }
};
