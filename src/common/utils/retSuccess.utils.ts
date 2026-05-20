import { Response } from 'express';
export const successReturn = (data: any, statusCode: number, res: Response) => {
  return res.status(statusCode).json(data);
};
