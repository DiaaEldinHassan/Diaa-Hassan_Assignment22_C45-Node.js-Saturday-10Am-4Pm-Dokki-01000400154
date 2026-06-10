import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ECategory } from '../../../common/enum';

export class ProductQueryDto {
  @IsOptional()
  @IsEnum(ECategory)
  category?: ECategory;

  @IsOptional()
  @IsString()
  brand?: string;
}
