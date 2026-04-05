import { Global, Module } from '@nestjs/common';
import { AccessPolicyService } from './policies/access-policy.service';
import { RolesGuard } from './guards/roles.guard';

@Global()
@Module({
  providers: [AccessPolicyService, RolesGuard],
  exports: [AccessPolicyService, RolesGuard],
})
export class CommonModule {}
