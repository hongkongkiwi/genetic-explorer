/**
 * Access Control Tests
 * 
 * Tests for data access control and ownership verification.
 */

import { describe, it, expect } from 'vitest';
import {
  DataAccessError,
  type ResourceType,
} from './access-control';

describe('Access Control', () => {
  describe('DataAccessError', () => {
    it('should create error with correct properties', () => {
      const error = new DataAccessError(
        'Access denied',
        'FORBIDDEN',
        'genome',
        'genome-123'
      );

      expect(error.message).toBe('Access denied');
      expect(error.code).toBe('FORBIDDEN');
      expect(error.resourceType).toBe('genome');
      expect(error.resourceId).toBe('genome-123');
      expect(error.name).toBe('DataAccessError');
    });

    it('should work without optional parameters', () => {
      const error = new DataAccessError('Unauthorized', 'UNAUTHORIZED');

      expect(error.message).toBe('Unauthorized');
      expect(error.code).toBe('UNAUTHORIZED');
      expect(error.resourceType).toBeUndefined();
      expect(error.resourceId).toBeUndefined();
    });

    it('should be instanceof Error', () => {
      const error = new DataAccessError('Test', 'FORBIDDEN');
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(DataAccessError);
    });
  });

  describe('ResourceType', () => {
    const validTypes: ResourceType[] = [
      'genome',
      'report',
      'profile',
      'sharing_permission',
      'sharing_invite',
      'snp_favorite',
      'activity_log',
      'session',
      'oauth_account',
    ];

    it('should accept all valid resource types', () => {
      validTypes.forEach(type => {
        expect(type).toBeTruthy();
      });
    });
  });
});
