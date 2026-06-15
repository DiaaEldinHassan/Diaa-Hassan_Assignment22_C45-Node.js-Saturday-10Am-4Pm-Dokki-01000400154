import 'multer';
import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
import { UserDBService, ProductDBService, ReviewDBService } from '../../common/service/db.service';
import { S3Service } from '../../common/service/s3.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CartDocument } from '../../db/models/cart.model';
import { decrypt, encrypt } from '../../common/utils/encryptDecrypt.utils';

@Injectable()
export class UserService {
  constructor(
    private readonly userDBService: UserDBService,
    private readonly productDBService: ProductDBService,
    private readonly reviewDBService: ReviewDBService,
    private readonly s3Service: S3Service,
    @InjectModel('Carts') private readonly cartModel: Model<CartDocument>,
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

  async getUserData(userId: string) {
    const doc = await this.userDBService.getBy({ _id: new Types.ObjectId(userId) });
    const userData: any = doc.toObject();

    if (userData.phone && Array.isArray(userData.phone) && userData.phone.length > 0) {
      try {
        userData.phone = decrypt(userData.phone);
      } catch {
        // leave as-is
      }
    }

    delete userData.password;
    delete userData.refreshToken;
    delete userData.emailVerificationOtp;
    delete userData.emailVerificationExpires;
    delete userData.resetPasswordOtp;
    delete userData.resetPasswordExpires;

    return userData;
  }

  async updateUserData(userId: string, updateData: any) {
    if (updateData.phone) {
      updateData.phone = [encrypt(updateData.phone)];
    }
    if (updateData.DOB) {
      updateData.DOB = new Date(updateData.DOB);
    }

    await this.userDBService.updateByID(new Types.ObjectId(userId), updateData);
    return { message: 'User data updated successfully', statusCode: 200 };
  }

  async getProducts(
    page: number = 1,
    limit: number = 10,
    category?: string,
    search?: string,
  ) {
    const filter: any = { approved: true };
    if (category) filter.category = category;
    if (search) filter.name = { $regex: search, $options: 'i' };

    const total = await this.productDBService['model'].countDocuments(filter);
    const totalPages = Math.ceil(total / limit);
    const skip = (page - 1) * limit;

    const products = await this.productDBService['model']
      .find(filter)
      .populate('seller', 'username')
      .skip(skip)
      .limit(limit)
      .exec();

    const productsWithUrls = await Promise.all(
      products.map(async (prod: any) => {
        const product = prod.toObject();
        if (product.images && product.images.length > 0) {
          product.images = await Promise.all(
            product.images.map(async (img: string) => {
              try {
                return await this.s3Service.getPresignedUrl(img);
              } catch {
                return img;
              }
            }),
          );
        }
        return product;
      }),
    );

    return {
      products: productsWithUrls,
      totalCount: total,
      totalPages,
      currentPage: page,
      hasNextPage: page < totalPages,
    };
  }

  async getProductById(prodId: string) {
    const doc = await this.productDBService.getBy({
      _id: new Types.ObjectId(prodId),
      approved: true,
    });
    const product: any = doc.toObject();

    if (product.images && product.images.length > 0) {
      product.images = await Promise.all(
        product.images.map(async (img: string) => {
          try {
            return await this.s3Service.getPresignedUrl(img);
          } catch {
            return img;
          }
        }),
      );
    }

    return product;
  }

  async getCart(userId: string) {
    const cart = await this.cartModel
      .findOne({ user: new Types.ObjectId(userId) })
      .populate('products.product')
      .exec();

    if (!cart) {
      return { products: [], totalPrice: 0 };
    }

    return cart;
  }

  async processCart(userId: string, productId: string, add: boolean) {
    const userObjectId = new Types.ObjectId(userId);
    const productObjectId = new Types.ObjectId(productId);

    let cart = await this.cartModel.findOne({ user: userObjectId }).exec();

    if (!cart) {
      if (!add) {
        throw new BadRequestException('Cart is empty');
      }
      cart = await this.cartModel.create({
        user: userObjectId,
        products: [],
        totalPrice: 0,
      });
    }

    const existingIndex = cart.products!.findIndex(
      (item) => item.product.toString() === productId,
    );

    if (add) {
      if (existingIndex > -1) {
        cart.products![existingIndex].quantity += 1;
      } else {
        cart.products!.push({
          product: productObjectId,
          quantity: 1,
          price: 0,
        });
      }
    } else {
      if (existingIndex === -1) {
        throw new NotFoundException('Product not found in cart');
      }
      if (cart.products![existingIndex].quantity > 1) {
        cart.products![existingIndex].quantity -= 1;
      } else {
        cart.products!.splice(existingIndex, 1);
      }
    }

    await cart.save();
    return { message: 'Cart updated successfully', statusCode: 200 };
  }

  async addReview(userId: string, productId: string, content: string, rating: number) {
    const productObjectId = new Types.ObjectId(productId);

    let reviewDoc = await this.reviewDBService['model']
      .findOne({ productId: productObjectId })
      .exec();

    if (!reviewDoc) {
      reviewDoc = await this.reviewDBService.createNewData({
        productId: productObjectId,
        reviews: [],
      });
    }

    reviewDoc.reviews!.push({
      userId: new Types.ObjectId(userId),
      content,
      productId: productObjectId,
      rating,
    });

    await reviewDoc.save();
    return { message: 'Review added successfully', statusCode: 200 };
  }

  async getProfilePic(userId: string) {
    const doc = await this.userDBService.getBy({ _id: new Types.ObjectId(userId) });
    const userData = doc.toObject();
    if (!userData.profilePicture) return '';
    try {
      return await this.s3Service.getPresignedUrl(userData.profilePicture);
    } catch {
      return userData.profilePicture;
    }
  }
}
