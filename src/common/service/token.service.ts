import { Injectable } from '@nestjs/common';
import jwt from 'jsonwebtoken';
import { env } from '../../config';
import { IUser, BadRequestError } from '../../common';

export interface TokenPayload {
  _id: string;
  username: string;
  email: string;
  role?: string;
}

@Injectable()
export class TokenService {
  generateTokens(payload: IUser): {
    accessToken: string;
    refreshToken: string;
  } {
    try {
      const sanitizedPayload: TokenPayload = {
        _id: payload._id!.toString(),
        username: payload.username,
        email: payload.email,
        role: payload.role,
      };
      const accessToken = jwt.sign(sanitizedPayload, env.access_sk, {
        expiresIn: '1h',
      });
      const refreshToken = jwt.sign(sanitizedPayload, env.refresh_sk, {
        expiresIn: '7d',
      });
      return { accessToken, refreshToken };
    } catch {
      throw new BadRequestError('Error Generating Token');
    }
  }

  verifyAccessToken(token: string): TokenPayload {
    try {
      return jwt.verify(token, env.access_sk) as TokenPayload;
    } catch {
      throw new BadRequestError('Invalid or expired access token');
    }
  }

  verifyRefreshToken(token: string): TokenPayload {
    try {
      return jwt.verify(token, env.refresh_sk) as TokenPayload;
    } catch {
      throw new BadRequestError('Invalid or expired refresh token');
    }
  }

  generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}
