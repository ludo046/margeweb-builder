import { IsString, Length } from 'class-validator';

export class Verify2faChallengeDto {
  @IsString() challenge_token!: string;

  @IsString()
  @Length(6, 6)
  code!: string;
}
