import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ProductDocument } from '../../db/models/products.model';
import { CreateProductDto, ProductQueryDto, UpdateProductDto } from './dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel('Products') private readonly productModel: Model<ProductDocument>,
  ) {}

  private buildActiveFilter(query?: ProductQueryDto) {
    const filter: any = {
      $or: [{ deletedAt: null }, { deletedAt: { $exists: false } }],
    };

    if (query?.category) {
      filter.category = query.category;
    }

    if (query?.brand) {
      filter.brand = query.brand;
    }

    return filter;
  }

  async getProducts(query: ProductQueryDto) {
    return this.productModel.find(this.buildActiveFilter(query)).sort({ createdAt: -1 }).exec();
  }

  async getProductsByCategory(category: string) {
    return this.productModel
      .find({ ...this.buildActiveFilter(), category })
      .sort({ createdAt: -1 })
      .exec();
  }

  async getProductsByBrand(brand: string) {
    return this.productModel
      .find({ ...this.buildActiveFilter(), brand })
      .sort({ createdAt: -1 })
      .exec();
  }

  async getProductById(id: string) {
    const product = await this.productModel
      .findOne({ _id: id, ...this.buildActiveFilter() })
      .exec();

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async createProduct(data: CreateProductDto) {
    return this.productModel.create(data);
  }

  async updateProduct(id: string, update: UpdateProductDto) {
    const product = await this.productModel
      .findOneAndUpdate({ _id: id, ...this.buildActiveFilter() }, update, {
        returnDocument: 'after',
        runValidators: true,
      })
      .exec();

    if (!product) {
      throw new NotFoundException('Product not found or already deleted');
    }

    return product;
  }

  async softDeleteProduct(id: string) {
    const product = await this.productModel
      .findOneAndUpdate(
        { _id: id, ...this.buildActiveFilter() },
        { $set: { deletedAt: new Date() }, $unset: { retrievedAt: '' } },
        { returnDocument: 'after' },
      )
      .exec();

    if (!product) {
      throw new NotFoundException('Product not found or already deleted');
    }

    return product;
  }

  async restoreProduct(id: string) {
    const product = await this.productModel
      .findOneAndUpdate(
        { _id: id, deletedAt: { $exists: true }, includeDeleted: true },
        { $unset: { deletedAt: '' }, $set: { retrievedAt: new Date() } },
        { returnDocument: 'after' },
      )
      .exec();

    if (!product) {
      throw new NotFoundException('Product not found or not deleted');
    }

    return product;
  }
}
