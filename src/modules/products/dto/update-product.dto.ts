import { IsArray, IsEnum, IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsString, ArrayNotEmpty, ArrayUnique, IsBoolean } from 'class-validator';
import { ECategory } from '../../../common/enum';

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  description?: string;

  @IsOptional()
  @IsNumber()
  price?: number;

  @IsOptional()
  @IsEnum(ECategory)
  category?: ECategory;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  brand?: string;

  @IsOptional()
  @IsNumber()
  stock?: number;

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique()
  @IsString({ each: true })
  images?: string[];

  @IsOptional()
  @IsMongoId()
  seller?: string;

  @IsOptional()
  @IsBoolean()
  approved?: boolean;
}
