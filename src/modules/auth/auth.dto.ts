import {
  IsEmail,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class UserLoginDTO {
  @IsEmail({}, { message: 'Email Is Not Valid' })
  email!: string;

  @IsString()
  @MinLength(8, { message: 'Minimum Length Of Password Is 8 Characters' })
  password!: string;
}

export class UserSignUpDTO extends UserLoginDTO {
  @IsString()
  username!: string;

  @IsOptional()
  @IsString()
  profilePicture?: string;

  @IsString()
  DOB!: Date;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsString()
  phone?: string;
}

export class GoogleAuthDTO {
  @IsString()
  token!: string;
}

export class ConfirmEmailDTO {
  @IsString()
  otp!: string;
}

export class ForgotPasswordDTO {
  @IsEmail({}, { message: 'Email Is Not Valid' })
  email!: string;
}

export class ResetPasswordDTO {
  @IsString()
  otp!: string;

  @IsString()
  @MinLength(8, { message: 'Minimum Length Of Password Is 8 Characters' })
  newPassword!: string;
}

export class RefreshTokenDTO {
  @IsString()
  refreshToken!: string;
}
