import { Types } from 'mongoose';
import { EProvider } from '../enum';
import { ERole } from '../enum/role.enum';

export interface IUserLog {
  email: string;
  password?: string;
}

export interface IGoogleUser {
  token: string;
}

export interface IPhone {
  iv: string;
  encryptedData: string;
}

export interface IUser extends IUserLog {
  _id?: Types.ObjectId;
  username: string;
  bio?: string | null | undefined;
  profilePicture?: string | null | undefined;
  phone?: IPhone[] | string | null | undefined;
  DOB?: Date | null | undefined;
  provider: EProvider;
  role?: ERole;
  isVerified?: boolean;
  emailVerificationOtp?: string | null | undefined;
  emailVerificationExpires?: Date | null | undefined;
  resetPasswordOtp?: string | null | undefined;
  resetPasswordExpires?: Date | null | undefined;
  refreshToken?: string | null | undefined;
  deletedAt?: Date | null | undefined;
  retrievedAt?: Date | null | undefined;
}

export interface IUserSignInReturn {
  message: string;
  accessToken: string;
  refreshToken: string;
  statusCode: number;
}

export interface IUserSignUpInput extends Omit<IUser, 'phone'> {
  phone?: string | null;
}
