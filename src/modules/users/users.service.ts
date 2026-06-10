import 'multer';
import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { UserDBService } from '../../common/service/db.service';
import { S3Service } from '../../common/service/s3.service';

@Injectable()
export class UserService {
  constructor(
    private readonly userDBService: UserDBService,
    private readonly s3Service: S3Service,
  ) {}

  async uploadProfilePicture(
    userId: Types.ObjectId,
    file: Express.Multer.File,
  ): Promise<string> {
    const ext = file.originalname.split('.').pop();
    const key = `profile-pictures/${userId.toString()}-${Date.now()}.${ext}`;

    const url = await this.s3Service.uploadFile(file.buffer, key, file.mimetype);

    await this.userDBService.updateByID(userId, { profilePicture: url });

    return url;
  }
}
