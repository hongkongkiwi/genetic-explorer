/**
 * Users Domain Module
 * 
 * User management, profiles, and preferences.
 * Re-exports from database-legacy during migration.
 */

export {
  createUser,
  getUserByEmail,
  getUserById,
  updateUser,
  updateUserLastLogin,
  getUserProfile,
  updateUserProfile,
  updateUserAvatar,
} from '../database-legacy';

export type {
  User,
  UserProfile,
} from '../database-legacy';
