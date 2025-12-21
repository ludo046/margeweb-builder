import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class AddMessageDto {
  @IsString()
  body!: string;

  @IsOptional()
  @IsBoolean()
  is_internal_note?: boolean;
}
