import {
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  Body,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  UserLoginDTO,
  UserSignUpDTO,
  GoogleAuthDTO,
  ConfirmEmailDTO,
  ForgotPasswordDTO,
  ResetPasswordDTO,
  RefreshTokenDTO,
} from './auth.dto';

@Controller('auth')
@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  async signUp(@Body() body: UserSignUpDTO) {
    return this.authService.signUp(body);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() body: UserLoginDTO) {
    return this.authService.login(body);
  }

  @Post('google')
  @HttpCode(HttpStatus.OK)
  async googleAuth(@Body() body: GoogleAuthDTO) {
    return this.authService.googleAuth(body.token);
  }

  @Post('confirm-email')
  @HttpCode(HttpStatus.OK)
  async confirmEmail(@Body() body: ConfirmEmailDTO) {
    return this.authService.confirmEmail(body.otp);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() body: ForgotPasswordDTO) {
    return this.authService.forgotPassword(body.email);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() body: ResetPasswordDTO) {
    return this.authService.resetPassword(body.otp, body.newPassword);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshToken(@Body() body: RefreshTokenDTO) {
    return this.authService.refreshToken(body.refreshToken);
  }
}
