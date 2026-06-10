import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import {
  IUserSignInReturn,
  EProvider,
  compareHash,
  encrypt,
  TokenService,
  EmailService,
  UserDBService,
  BadRequestError,
  NotFoundError,
  ConflictError,
  verifyGoogleToken,
} from '../../common';

@Injectable()
export class AuthService {
  constructor(
    private readonly tokenService: TokenService,
    private readonly emailService: EmailService,
    private readonly userDBService: UserDBService,
  ) {}

  async signUp(userData: {
    username: string;
    email: string;
    password: string;
    DOB: Date;
    bio?: string;
    phone?: string;
    profilePicture?: string;
  }): Promise<{ message: string; statusCode: number }> {
    try {
      const existing = await this.userDBService
        .getBy({ email: userData.email })
        .catch(() => null);
      if (existing) {
        throw new ConflictError('Email is already registered');
      }

      const otp = this.tokenService.generateOtp();

      const encryptedPhone = userData.phone
        ? encrypt(userData.phone)
        : undefined;

      await this.userDBService.createNewData({
        username: userData.username,
        email: userData.email,
        password: userData.password,
        DOB: new Date(userData.DOB),
        provider: EProvider.local,
        bio: userData.bio || null,
        phone: encryptedPhone ? [encryptedPhone] : null,
        profilePicture: userData.profilePicture || null,
        isVerified: false,
        emailVerificationOtp: otp,
        emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      } as any);

      try {
        await this.emailService.sendVerificationEmail(userData.email, otp);
      } catch (emailError) {
        console.log(emailError)
        console.error('Failed to send verification email:', emailError);
      }

      return {
        message:
          'User created successfully. Please check your email to verify your account.',
        statusCode: 201,
      };
    } catch (error: unknown) {
      console.log(error)
      if (error instanceof ConflictError) throw error;
      throw new BadRequestError(
        error instanceof Error ? error.message : 'Sign Up Error',
      );
    }
  }

  async login(userData: {
    email: string;
    password: string;
  }): Promise<IUserSignInReturn> {
    try {
      const doc = await this.userDBService.getBy({ email: userData.email });
      const user = doc.toObject();

      if (user.deletedAt) {
        throw new NotFoundError('User');
      }

      if (!user.isVerified) {
        throw new BadRequestError('Please verify your email before logging in');
      }

      const isPasswordMatch = await compareHash(
        user.password as string,
        userData.password,
      );

      if (!isPasswordMatch) {
        throw new BadRequestError('Invalid password');
      }

      const tokens = this.tokenService.generateTokens(user);
      await this.userDBService.updateByID(user._id!, {
        refreshToken: tokens.refreshToken,
      });

      return {
        message: 'User signed in successfully',
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        statusCode: 200,
      };
    } catch (error: unknown) {
      if (error instanceof NotFoundError || error instanceof BadRequestError) {
        throw error;
      }
      throw new BadRequestError(
        error instanceof Error ? error.message : 'Login Error',
      );
    }
  }

  async googleAuth(token: string): Promise<IUserSignInReturn> {
    try {
      const googlePayload = await verifyGoogleToken(token);
      if (!googlePayload || !googlePayload.email) {
        throw new BadRequestError('Invalid Google token payload');
      }

      let doc = await this.userDBService
        .getBy({ email: googlePayload.email })
        .catch(() => null);

      if (!doc) {
        await this.userDBService.createNewData({
          username: googlePayload.username || googlePayload.email.split('@')[0],
          email: googlePayload.email,
          password: '',
          provider: EProvider.google,
          profilePicture: googlePayload.profilePicture,
          DOB: null,
          isVerified: true,
        } as any);
        doc = await this.userDBService.getBy({ email: googlePayload.email });
      }

      const user = doc.toObject();

      if (user.deletedAt) {
        throw new NotFoundError('User');
      }

      if (!user.isVerified) {
        await this.userDBService.updateByID(user._id!, { isVerified: true });
        user.isVerified = true;
      }

      const tokens = this.tokenService.generateTokens(user);
      await this.userDBService.updateByID(user._id!, {
        refreshToken: tokens.refreshToken,
      });

      return {
        message: 'User signed in successfully via Google',
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        statusCode: 200,
      };
    } catch (error: unknown) {
      if (error instanceof BadRequestError || error instanceof NotFoundError) {
        throw error;
      }
      throw new BadRequestError(
        error instanceof Error ? error.message : 'Google Auth Error',
      );
    }
  }

  async confirmEmail(
    otp: string,
  ): Promise<{ message: string; statusCode: number }> {
    try {
      const doc = await this.userDBService
        .getBy({ emailVerificationOtp: otp })
        .catch(() => null);

      if (!doc) {
        throw new BadRequestError('Invalid or expired OTP');
      }

      const user = doc.toObject();
      if (
        user.emailVerificationExpires &&
        new Date(user.emailVerificationExpires) < new Date()
      ) {
        throw new BadRequestError('OTP has expired');
      }

      await this.userDBService.updateByID(user._id!, {
        isVerified: true,
        emailVerificationOtp: null,
        emailVerificationExpires: null,
      });

      return {
        message: 'Email verified successfully',
        statusCode: 200,
      };
    } catch (error: unknown) {
      if (error instanceof BadRequestError) throw error;
      throw new BadRequestError(
        error instanceof Error ? error.message : 'Email Confirmation Error',
      );
    }
  }

  async forgotPassword(
    email: string,
  ): Promise<{ message: string; statusCode: number }> {
    try {
      const doc = await this.userDBService.getBy({ email });
      const user = doc.toObject();

      const otp = this.tokenService.generateOtp();

      await this.userDBService.updateByID(user._id!, {
        resetPasswordOtp: otp,
        resetPasswordExpires: new Date(Date.now() + 60 * 60 * 1000),
      });

      try {
        await this.emailService.sendPasswordResetEmail(email, otp);
      } catch (emailError) {
        console.error('Failed to send password reset email:', emailError);
      }

      return {
        message: 'Password reset OTP sent to your email',
        statusCode: 200,
      };
    } catch (error: unknown) {
      if (error instanceof NotFoundError) {
        return {
          message:
            'If that email is registered, a password reset OTP has been sent',
          statusCode: 200,
        };
      }
      throw new BadRequestError(
        error instanceof Error ? error.message : 'Forgot Password Error',
      );
    }
  }

  async resetPassword(
    otp: string,
    newPassword: string,
  ): Promise<{ message: string; statusCode: number }> {
    try {
      const doc = await this.userDBService
        .getBy({ resetPasswordOtp: otp })
        .catch(() => null);

      if (!doc) {
        throw new BadRequestError('Invalid or expired OTP');
      }

      const user = doc.toObject();
      if (
        user.resetPasswordExpires &&
        new Date(user.resetPasswordExpires) < new Date()
      ) {
        throw new BadRequestError('OTP has expired');
      }

      await this.userDBService.updateByID(user._id!, {
        password: newPassword,
        resetPasswordOtp: null,
        resetPasswordExpires: null,
      });

      return {
        message: 'Password reset successfully',
        statusCode: 200,
      };
    } catch (error: unknown) {
      if (error instanceof BadRequestError) throw error;
      throw new BadRequestError(
        error instanceof Error ? error.message : 'Reset Password Error',
      );
    }
  }

  async refreshToken(refreshToken: string): Promise<IUserSignInReturn> {
    try {
      const payload = this.tokenService.verifyRefreshToken(refreshToken);

      const doc = await this.userDBService.getBy({
        _id: new Types.ObjectId(payload._id),
      });
      const user = doc.toObject();

      if (user.refreshToken !== refreshToken) {
        throw new BadRequestError('Invalid refresh token');
      }

      const tokens = this.tokenService.generateTokens(user);
      await this.userDBService.updateByID(user._id!, {
        refreshToken: tokens.refreshToken,
      });

      return {
        message: 'Token refreshed successfully',
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        statusCode: 200,
      };
    } catch (error: unknown) {
      if (error instanceof BadRequestError) throw error;
      throw new BadRequestError(
        error instanceof Error ? error.message : 'Token Refresh Error',
      );
    }
  }
}
