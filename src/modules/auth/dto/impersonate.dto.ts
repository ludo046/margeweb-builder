import { IsInt, IsString, MaxLength, Min } from 'class-validator';

export class ImpersonateDto {
  @IsInt()
  @Min(1)
  user_id!: number;

  @IsString()
  @MaxLength(240)
  reason!: string;
}
