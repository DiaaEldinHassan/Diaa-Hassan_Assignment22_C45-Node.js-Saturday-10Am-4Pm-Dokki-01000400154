import {
  Controller,
  Delete,
  Patch,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../../guards/auth.guard';
import { UserDBService, ProductDBService } from '../../common/service/db.service';
import { Types } from 'mongoose';

@UseGuards(AuthGuard)
@Controller('admin')
export class AdminController {
  constructor(
    private readonly userDBService: UserDBService,
    private readonly productDBService: ProductDBService,
  ) {}

  @Delete('users/:id')
  async deleteUser(
    @Param('id') id: string,
    @Query('force') force?: string,
  ) {
    const objectId = new Types.ObjectId(id);

    if (force === 'true') {
      await this.userDBService.deleteByID(objectId);
      return { message: 'User permanently deleted', statusCode: 200 };
    }

    await this.userDBService.updateByID(objectId, { deletedAt: new Date() });
    return { message: 'User soft deleted', statusCode: 200 };
  }

  @Patch('users/:id/restore')
  async restoreUser(@Param('id') id: string) {
    const objectId = new Types.ObjectId(id);
    await this.userDBService.updateByID(objectId, {
      $unset: { deletedAt: '' },
      retrievedAt: new Date(),
    });
    return { message: 'User restored', statusCode: 200 };
  }

  @Patch('products/:id/approve')
  async productApprove(
    @Param('id') id: string,
    @Query('approved') approved?: string,
  ) {
    const objectId = new Types.ObjectId(id);
    const bool = approved !== 'false';
    await this.productDBService.updateByID(objectId, { approved: bool });
    return {
      message: bool ? 'Product approved' : 'Product rejected',
      statusCode: 200,
    };
  }
}
