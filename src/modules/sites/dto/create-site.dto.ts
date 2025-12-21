import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateSiteDto {
  @IsString() @MaxLength(120)
  name!: string;

  @IsString() @MaxLength(80)
  slug!: string;

  @IsOptional() @IsString() @MaxLength(190)
  domain?: string;

  @IsOptional() @IsString() @MaxLength(80)
  subdomain?: string;
}
