import { Module } from '@nestjs/common';
import { EventsGateway } from './events.gateway';

@Module({
  providers: [EventsGateway],
})
export class EventsModule {
  //   OnGatewayInit() {
  //     console.log('OnGatewayInit');
  //   }
  //   OnGatewayConnection() {
  //     console.log('OnGatewayConnection');
  //   }
  //   OnGatewayDisconnect() {
  //     console.log('OnGatewayDisconnect');
  //   }
}
