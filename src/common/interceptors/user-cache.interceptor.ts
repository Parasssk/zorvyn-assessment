import { Injectable, ExecutionContext } from '@nestjs/common';
import { CacheInterceptor } from '@nestjs/cache-manager';

@Injectable()
export class UserCacheInterceptor extends CacheInterceptor {
  trackBy(context: ExecutionContext): string | undefined {
    const request = context.switchToHttp().getRequest();
    const isGetRequest = request.method === 'GET';
    const routePath = request.route?.path || request.path;
    const userId = request.user?.sub || request.user?.id || 'anonymous';
    
    // Only cache GET requests. Create a composite key based on route path and userId.
    if (isGetRequest) {
      return `${routePath}-${userId}`;
    }
    
    return undefined;
  }
}
