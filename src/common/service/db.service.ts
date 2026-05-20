import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { HydratedDocument, Model, Types } from 'mongoose';
import { BadRequestError, NotFoundError, IUser, IProd } from '../index';

export class DBService<T> {
  constructor(protected model: Model<T>) {}

  async getBy(filter: any): Promise<HydratedDocument<T>> {
    try {
      const data = await this.model.findOne(filter);
      if (!data) {
        throw new NotFoundError('Resource not found');
      }
      return data;
    } catch (error: any) {
      if (error instanceof NotFoundError) throw error;
      throw new BadRequestError(error.message || 'Get By Method Error');
    }
  }

  async getById(id: Types.ObjectId): Promise<HydratedDocument<T>> {
    try {
      const data = await this.model.findById(id);
      if (!data) {
        throw new NotFoundError('Resource not found');
      }
      return data;
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      throw new BadRequestError((error as Error).message);
    }
  }

  async getAll(): Promise<HydratedDocument<T>[]> {
    try {
      return await this.model.find();
    } catch (error) {
      throw new BadRequestError((error as Error).message);
    }
  }

  async createNewData(data: Partial<T>) {
    try {
      return await this.model.create(data);
    } catch (error) {
      throw new BadRequestError((error as Error).message);
    }
  }

  async updateByID(id: Types.ObjectId, data: any) {
    try {
      return await this.model.findByIdAndUpdate(id, data, {
        new: true,
        runValidators: true,
      });
    } catch (error) {
      throw new BadRequestError((error as Error).message);
    }
  }

  async deleteByID(id: Types.ObjectId) {
    try {
      return await this.model.findByIdAndDelete(id);
    } catch (error) {
      throw new BadRequestError((error as Error).message);
    }
  }
}

@Injectable()
export class UserDBService extends DBService<IUser> {
  constructor(@InjectModel('Users') model: Model<IUser>) {
    super(model);
  }
}

@Injectable()
export class ProductDBService extends DBService<IProd> {
  constructor(@InjectModel('Products') model: Model<IProd>) {
    super(model);
  }
}
