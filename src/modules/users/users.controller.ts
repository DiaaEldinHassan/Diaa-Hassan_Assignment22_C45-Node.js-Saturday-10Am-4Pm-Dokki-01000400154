import 'multer';
import {
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { AuthGuard } from '../../guards/auth.guard';
import { UserService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly userService: UserService) {}

  @Post('profile-picture')
  @UseGuards(AuthGuard)
  @UseInterceptors(
    FileInterceptor('profilePicture', {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async uploadProfilePicture(
    @UploadedFile() file: Express.Multer.File,
    @Request() req: any,
  ) {
    if (!file) {
      throw new BadRequestException(
        'Profile picture file is required. Send multipart/form-data with field name "profilePicture".',
      );
    }

    const url = await this.userService.uploadProfilePicture(
      req.user._id,
      file,
    );
    return { message: 'Profile picture uploaded successfully', url };
  }
}
