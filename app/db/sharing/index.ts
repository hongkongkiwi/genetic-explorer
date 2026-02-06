/**
 * Sharing Domain Module
 * 
 * Data sharing permissions, invites, and audit logging.
 * Re-exports from database-legacy during migration.
 */

export {
  createSharingPermission,
  createSharingInvite,
  getSharingInviteByToken,
  acceptSharingInvite,
  getSharedWithMe,
  getMyShares,
  revokeSharingPermission,
} from '../database-legacy';

export type {
  SharingPermission,
  SharingInvite,
} from '../database-legacy';
