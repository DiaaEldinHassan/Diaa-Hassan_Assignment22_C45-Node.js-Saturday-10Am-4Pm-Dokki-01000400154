import { v4 as uuidv4 } from 'uuid';

export const generateRandomName = (userId: string, fileName: string): string => {
  const ext = fileName.split('.').pop();
  return `${userId}/_${uuidv4()}.${ext}`;
};
