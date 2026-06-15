import 'multer';
import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  Request,
  Body,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { AuthGuard } from '../../guards/auth.guard';
import { S3Service } from '../../common/service/s3.service';
import { ProductDBService } from '../../common/service/db.service';
import { generateRandomName } from '../../common/utils/nameGenerator.utils';
import { Types } from 'mongoose';

@Controller('seller')
export class SellerController {
  constructor(
    private readonly s3Service: S3Service,
    private readonly productDBService: ProductDBService,
  ) {}

  @Get()
  getHello() {
    return { message: 'Hello from seller route' };
  }

  @Post('add-product')
  @UseGuards(AuthGuard)
  @UseInterceptors(
    FileInterceptor('prod-img', {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async addProduct(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any,
    @Request() req: any,
  ) {
    if (!file) {
      throw new BadRequestException('Product image is required');
    }

    const key = generateRandomName(req.user._id.toString(), file.originalname);
    await this.s3Service.uploadFile(file.buffer, key, file.mimetype);

    const product = await this.productDBService.createNewData({
      name: body.name,
      description: body.description,
      price: Number(body.price),
      category: body.category,
      stock: Number(body.stock),
      images: [key],
      seller: new Types.ObjectId(req.user._id),
      approved: false,
    });

    return {
      message: 'Product added successfully and pending approval',
      product,
      statusCode: 201,
    };
  }

  @Delete('products/:id')
  @UseGuards(AuthGuard)
  async removeProduct(@Param('id') id: string, @Request() req: any) {
    const doc = await this.productDBService.getBy({
      _id: new Types.ObjectId(id),
      seller: new Types.ObjectId(req.user._id),
    });

    await this.productDBService.deleteByID(new Types.ObjectId(id));
    return { message: 'Product removed successfully', statusCode: 200 };
  }
}
