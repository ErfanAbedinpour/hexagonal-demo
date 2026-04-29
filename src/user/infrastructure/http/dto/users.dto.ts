import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    example: 'user-123',
    description: 'Unique user identifier',
  })
  identifier: string;
  @ApiProperty({
    example: 'Test User',
  })
  name: string;
}
