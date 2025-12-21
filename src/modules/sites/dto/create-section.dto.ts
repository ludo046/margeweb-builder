import { IsInt, IsObject, IsOptional, IsString, Min } from 'class-validator';

export class CreateSectionDto {
  @IsString()
  type!: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  sort_order?: number;

  @IsObject()
  data!: any;

  @IsOptional()
  @IsObject()
  style?: any;
}
