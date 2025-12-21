import { IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreateTicketDto {
  @IsString()
  @MaxLength(140)
  subject!: string;

  @IsString()
  body!: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  site_id?: number;
}
