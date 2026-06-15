import 'multer';
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  Request,
  Body,
  Query,
  Param,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { AuthGuard } from '../../guards/auth.guard';
import { UserService } from './users.service';

@UseGuards(AuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  async getUserData(@Request() req: any) {
    return this.userService.getUserData(req.user._id);
  }

  @Patch('me')
  async updateUserData(@Request() req: any, @Body() body: any) {
    return this.userService.updateUserData(req.user._id, body);
  }

  @Post('profile-picture')
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

  @Get('profile-picture')
  async getProfilePic(@Request() req: any) {
    const url = await this.userService.getProfilePic(req.user._id);
    return { profilePicture: url };
  }

  @Get('products')
  async getProducts(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('category') category?: string,
    @Query('search') search?: string,
  ) {
    return this.userService.getProducts(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 10,
      category,
      search,
    );
  }

  @Get('products/:id')
  async getProductById(@Param('id') id: string) {
    return this.userService.getProductById(id);
  }

  @Get('cart')
  async getCart(@Request() req: any) {
    return this.userService.getCart(req.user._id);
  }

  @Post('cart')
  async processCart(
    @Request() req: any,
    @Body() body: { productId: string; add: boolean },
  ) {
    return this.userService.processCart(req.user._id, body.productId, body.add);
  }

  @Post('reviews')
  async addReview(
    @Request() req: any,
    @Body() body: { productId: string; content: string; rating: number },
  ) {
    return this.userService.addReview(
      req.user._id,
      body.productId,
      body.content,
      body.rating,
    );
  }
}
