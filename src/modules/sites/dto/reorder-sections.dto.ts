import { ArrayMinSize, IsArray, IsInt, Min } from 'class-validator';

export class ReorderSectionsDto {
  @IsArray()
  @ArrayMinSize(0)
  section_ids!: number[];
}
