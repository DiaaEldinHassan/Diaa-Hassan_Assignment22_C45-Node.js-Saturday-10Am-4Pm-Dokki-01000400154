import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto, ProductQueryDto, UpdateProductDto } from './dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  async getProducts(@Query() query: ProductQueryDto) {
    return this.productsService.getProducts(query);
  }

  @Get('category/:category')
  async getProductsByCategory(@Param('category') category: string) {
    return this.productsService.getProductsByCategory(category);
  }

  @Get('brand/:brand')
  async getProductsByBrand(@Param('brand') brand: string) {
    return this.productsService.getProductsByBrand(brand);
  }

  @Get(':id')
  async getProductById(@Param('id') id: string) {
    return this.productsService.getProductById(id);
  }

  @Post()
  async createProduct(@Body() dto: CreateProductDto) {
    return this.productsService.createProduct(dto);
  }

  @Patch(':id')
  async updateProduct(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.productsService.updateProduct(id, dto);
  }

  @Delete(':id')
  async softDeleteProduct(@Param('id') id: string) {
    return this.productsService.softDeleteProduct(id);
  }

  @Post(':id/restore')
  async restoreProduct(@Param('id') id: string) {
    return this.productsService.restoreProduct(id);
  }
}
