import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreatePageDto {
  @IsString() @MaxLength(140)
  title!: string;

  @IsString() @MaxLength(120)
  slug!: string;

  @IsOptional() @IsBoolean()
  is_home?: boolean;
}
