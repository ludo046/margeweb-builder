import { IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreateSiteDto {
  @IsInt()
  @Min(1)
  tenant_id!: number;

  @IsString()
  @MaxLength(120)
  name!: string;

  // ex: "demo" => demo.margeweb.fr (plus tard)
  @IsOptional()
  @IsString()
  @MaxLength(80)
  subdomain?: string;

  // ex: "client.fr" (plus tard)
  @IsOptional()
  @IsString()
  @MaxLength(190)
  domain?: string;
}
