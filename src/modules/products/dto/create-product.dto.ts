import { IsArray, IsEnum, IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsString, ArrayNotEmpty, ArrayUnique } from 'class-validator';
import { ECategory } from '../../../common/enum';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  price: number;

  @IsEnum(ECategory)
  category: ECategory;

  @IsString()
  @IsNotEmpty()
  brand: string;

  @IsNumber()
  stock: number;

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique()
  @IsString({ each: true })
  images?: string[];

  @IsMongoId()
  seller: string;

  @IsOptional()
  approved?: boolean;
}
