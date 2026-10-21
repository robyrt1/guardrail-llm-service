import { IsNotEmpty, IsString } from 'class-validator';

export class ChatPromptDto {
  @IsString()
  @IsNotEmpty()
  prompt!: string;
}
