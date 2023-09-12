import {
  SubscribeMessage,
  WebSocketGateway,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Inject } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

import { RedisService } from '../redis/redis.service';
import { getParams, getUserDetailByUid } from '../utils';

@WebSocketGateway(18080, {
  transports: ['websocket'],
  cors: {
    origin: '*',
  },
})
export class EventsGateway {
  userMap: Map<string, Socket>;
  roomKey: string;

  constructor() {
    this.userMap = new Map(); // user - > socket 每个连入的用户，对应的socket实例，用于点对点发消息
    this.roomKey = 'meeting-room::';
  }

  @Inject(RedisService)
  private redisService: RedisService;

  @WebSocketServer()
  server: Server;

  async handleConnection(socket: Socket) {
    const url = socket.client.request.url;
    const userId = getParams(url, 'userId');
    const roomId = getParams(url, 'roomId');
    const nickname = getParams(url, 'nickname');
    const pub = getParams(url, 'pub');

    console.log(
      'client uid：' +
        userId +
        ' roomId: ' +
        roomId +
        ' 【' +
        nickname +
        '】online ',
    );

    //user map
    this.userMap.set(userId, socket);
    //room cache
    if (roomId) {
      const obj: any = {};
      obj[userId] = getUserDetailByUid(userId, roomId, nickname, pub);
      await this.redisService.hashSet(this.roomKey + roomId, obj);
      this.oneToRoomMany(
        roomId,
        this.getMsg('join', userId + ' join then room', 200, {
          userId: userId,
          nickname: nickname,
        }),
      );
    }
  }

  handleDisconnect() {
    console.log('handleDisconnect');
  }

  afterInit() {
    console.log('after socket init');
  }

  @SubscribeMessage('events')
  handleEvent(@MessageBody() data: string): string {
    return data;
  }

  @SubscribeMessage('applyMic')
  applyMic(@MessageBody() data: string) {
    const targetUid = data['targetUid'];
    console.log('targetUid', targetUid);
    this.oneToOne(targetUid, this.getMsg('applyMic', 'apply mic', 200, data));
  }

  @SubscribeMessage('acceptApplyMic')
  acceptApplyMic(@MessageBody() data: string) {
    const targetUid = data['targetUid'];
    console.log('targetUid', targetUid);
    this.oneToOne(
      targetUid,
      this.getMsg('acceptApplyMic', 'acceptApplyMic mic', 200, data),
    );
  }

  @SubscribeMessage('msg')
  async identity(
    @MessageBody() data: number,
    @ConnectedSocket() client: Socket,
  ): Promise<number> {
    console.log('data', data, client.request.url);
    return data;
  }

  @SubscribeMessage('roomUserList')
  async roomUserList(
    @MessageBody() data: Record<string, string>,
    @ConnectedSocket() client: Socket,
  ) {
    const users = await this.getRoomOnlyUserList(data['roomId']);
    client.emit('roomUserList', users);
  }

  /**
   * 获取房间用户列表(list)
   * @author suke
   * @param {Object} roomId
   */
  async getRoomOnlyUserList(roomId: string) {
    const resList = [];
    const uMap = await this.redisService.hashGet(this.roomKey + roomId);
    for (const key in uMap) {
      const detail = JSON.parse(uMap[key]);
      resList.push(detail);
    }
    return resList;
  }

  /**
   * ono to one
   * @author suke
   * @param {Object} uid
   * @param {Object} msg
   */
  oneToOne(uid: string, msg: Record<string, any>) {
    const s = this.userMap.get(uid);
    if (s) {
      s.emit('msg', msg);
    } else {
      console.log(uid + '用户不在线');
    }
  }

  /**
   * 获取房间用户列表(k-v) 原始KV数据
   * @author suke
   * @param {Object} roomId
   */
  async getRoomUser(roomId: string) {
    return await this.redisService.hashGet(this.roomKey + roomId);
  }

  /**
   * broadcast
   * @author suc
   * @param {Object} roomId
   * @param {Object} msg
   */
  async oneToRoomMany(roomId: string, msg: Record<string, any>) {
    const uMap = await this.getRoomUser(roomId);
    for (const uid in uMap) {
      this.oneToOne(uid, msg);
    }
  }

  getMsg(type: string, msg: string, status?: number, data?: any) {
    return { type: type, msg: msg, status: status, data: data };
  }
}
