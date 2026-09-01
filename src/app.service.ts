import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealth() {
    return {
      app: 'InvaHub API',
      status: 'running',
    };
  }
}