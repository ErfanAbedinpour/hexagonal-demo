import { ApiProperty } from '@nestjs/swagger';

export class SendNotificationDto {
  @ApiProperty()
  destination: string;

  @ApiProperty()
  message: string;
}
