import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { JwksService } from './jwks.service';
import { RequestUser } from '../../common/types/auth.types';

export const BEARER_PREFIX = 'Bearer ';

@Injectable()
export class JwtGuard implements CanActivate {
  constructor(private readonly jwksService: JwksService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith(BEARER_PREFIX)) {
      throw new UnauthorizedException('Missing or invalid Authorization header');
    }

    const token = authHeader.slice(BEARER_PREFIX.length).trim();
    if (!token) {
      throw new UnauthorizedException('Missing token');
    }

    try {
      const payload = await this.jwksService.verify(token);
      const user: RequestUser = {
        sub: payload.sub,
        email: payload.email,
        phone: payload.phone,
      };
      (request as Request & { user: RequestUser }).user = user;
      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
