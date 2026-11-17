import {
  IsEmail,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

import { MaxPasswordBytes } from '../validators/password-byte-length.validator.js';

export class RegisterDto {
  @IsEmail()
  @MaxLength(254)
  email!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(72)
  @MaxPasswordBytes(72)
  password!: string;
}