import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { EProvider } from '../../common/enum';
import { ERole } from '../../common/enum/role.enum';
import { hashing } from '../../common/utils/hash.utils';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true, optimisticConcurrency: true, collection: 'Users' })
export class User {
  @Prop({ required: true, minlength: 3, maxlength: 10 })
  username: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop()
  bio?: string;

  @Prop()
  profilePicture?: string;

  @Prop({ required: true, enum: Object.values(EProvider), default: EProvider.local })
  provider: string;

  @Prop({ required: true, type: Date })
  DOB?: Date;

  @Prop({ enum: ERole, default: ERole.customer })
  role?: string;

  @Prop({ type: [{ iv: { type: String, required: true }, encryptedData: { type: String, required: true } }] })
  phone?: { iv: string; encryptedData: string }[];

  @Prop({ default: false })
  isVerified?: boolean;

  @Prop()
  emailVerificationOtp?: string;

  @Prop({ type: Date })
  emailVerificationExpires?: Date;

  @Prop()
  resetPasswordOtp?: string;

  @Prop({ type: Date })
  resetPasswordExpires?: Date;

  @Prop()
  refreshToken?: string;

  @Prop({ type: Date })
  deletedAt?: Date;

  @Prop({ type: Date })
  retrievedAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await hashing(this.password);
});

UserSchema.pre('findOneAndUpdate', async function () {
  const update = this.getUpdate();
  if (update && typeof update === 'object' && 'password' in update) {
    (update as any).password = await hashing(update.password);
  }
});
