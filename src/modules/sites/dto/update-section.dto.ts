import { IsObject, IsOptional } from 'class-validator';

export class UpdateSectionDto {
  @IsOptional() @IsObject()
  data?: any;

  @IsOptional() @IsObject()
  style?: any;
}
