import { Injectable } from '@nestjs/common';
import { Role } from '../enums/role.enum';
import { User } from '@prisma/client';

@Injectable()
export class AccessPolicyService {
  /**
   * Check if a user can read records based on filters.
   * Analyst can only view records of the last 90 days.
   * Viewer can only view summary, not raw records (handled at controller/service level).
   */
  canReadRecords(user: User, filters: any): boolean {
    if (user.role === Role.ADMIN) return true;

    if (user.role === Role.ANALYST) {
      // Logic for 90 days restriction will be applied in the Record Service
      // by injecting this policy and modifying the query filters.
      return true;
    }

    if (user.role === Role.VIEWER) {
      // Viewers can't see raw records, only summary
      return false;
    }

    return false;
  }

  /**
   * Get date restriction for Analyst role (90 days).
   */
  getAnalystDateRestriction(): Date {
    const date = new Date();
    date.setDate(date.getDate() - 90);
    return date;
  }

  /**
   * Check if user can modify a record.
   * Only ADMIN or the owner of the record (if applicable) can modify.
   * In this system, we'll assume ADMIN can modify everything,
   * and users can only modify their own records.
   */
  canModifyRecord(user: User, recordUserId: string): boolean {
    if (user.role === Role.ADMIN) return true;
    return user.id === recordUserId;
  }
}
