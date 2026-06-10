import { Injectable } from '@nestjs/common';
import jwt, { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import { env } from '../../config';
import { IUser, BadRequestError } from '../../common';

export interface TokenPayload {
  _id: string;
  username: string;
  email: string;
  role?: string;
  exp?: number;
  iat?: number;
}

@Injectable()
export class TokenService {
  // Token expiration constants
  private readonly ACCESS_TOKEN_EXPIRY = '1h';
  private readonly REFRESH_TOKEN_EXPIRY = '7d';

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
        expiresIn: this.ACCESS_TOKEN_EXPIRY,
      });

      const refreshToken = jwt.sign(sanitizedPayload, env.refresh_sk, {
        expiresIn: this.REFRESH_TOKEN_EXPIRY,
      });

      return { accessToken, refreshToken };
    } catch (error) {
      throw new BadRequestError('Error generating tokens');
    }
  }

  verifyAccessToken(token: string): TokenPayload {
    try {
      const decoded = jwt.verify(token, env.access_sk) as TokenPayload;
      return decoded;
    } catch (error) {
      // Handle specific JWT errors
      if (error instanceof TokenExpiredError) {
        throw new BadRequestError('Access token has expired');
      }
      if (error instanceof JsonWebTokenError) {
        throw new BadRequestError('Invalid access token');
      }
      throw new BadRequestError('Error verifying access token');
    }
  }

  verifyRefreshToken(token: string): TokenPayload {
    try {
      const decoded = jwt.verify(token, env.refresh_sk) as TokenPayload;
      return decoded;
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        throw new BadRequestError('Refresh token has expired');
      }
      if (error instanceof JsonWebTokenError) {
        throw new BadRequestError('Invalid refresh token');
      }
      throw new BadRequestError('Error verifying refresh token');
    }
  }

  generateOtp(): string {
    // More secure OTP generation
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Optional: Decode token without verification
  decodeToken(token: string): TokenPayload | null {
    try {
      return jwt.decode(token) as TokenPayload;
    } catch {
      return null;
    }
  }

  // Optional: Check if token is expired
  isTokenExpired(token: string): boolean {
    try {
      const decoded = jwt.decode(token) as any;
      if (!decoded || !decoded.exp) return true;
      
      const currentTime = Math.floor(Date.now() / 1000);
      return decoded.exp < currentTime;
    } catch {
      return true;
    }
  }

  // Optional: Get remaining time in seconds
  getTokenRemainingTime(token: string): number {
    try {
      const decoded = jwt.decode(token) as any;
      if (!decoded || !decoded.exp) return 0;
      
      const currentTime = Math.floor(Date.now() / 1000);
      return Math.max(0, decoded.exp - currentTime);
    } catch {
      return 0;
    }
  }
}