/**
 * Advanced Sharing Tests
 * 
 * Tests for the advanced sharing system with different relationship types.
 */

import { describe, it, expect } from 'vitest';
import {
  SHARE_TYPES,
  type ShareType,
} from './advanced';

describe('Advanced Sharing', () => {
  describe('SHARE_TYPES', () => {
    it('should have all required share types', () => {
      expect(SHARE_TYPES).toHaveLength(5);
      const types = SHARE_TYPES.map(t => t.type);
      expect(types).toContain('family');
      expect(types).toContain('friend');
      expect(types).toContain('healthcare');
      expect(types).toContain('research');
      expect(types).toContain('public');
    });

    it('should have correct family sharing configuration', () => {
      const family = SHARE_TYPES.find(t => t.type === 'family');
      expect(family?.allowsRawData).toBe(true);
      expect(family?.allowsGeneticMatching).toBe(true);
      expect(family?.requiresApproval).toBe(false);
      expect(family?.defaultLevel).toBe('highly_sensitive');
    });

    it('should have correct friend sharing configuration', () => {
      const friend = SHARE_TYPES.find(t => t.type === 'friend');
      expect(friend?.allowsRawData).toBe(false);
      expect(friend?.allowsGeneticMatching).toBe(false);
      expect(friend?.requiresApproval).toBe(true);
      expect(friend?.defaultLevel).toBe('normal');
    });

    it('should have correct healthcare sharing configuration', () => {
      const healthcare = SHARE_TYPES.find(t => t.type === 'healthcare');
      expect(healthcare?.allowsRawData).toBe(true);
      expect(healthcare?.requiresApproval).toBe(false);
      expect(healthcare?.defaultLevel).toBe('highly_sensitive');
    });

    it('should have correct research sharing configuration', () => {
      const research = SHARE_TYPES.find(t => t.type === 'research');
      expect(research?.allowsRawData).toBe(false);
      expect(research?.allowsGeneticMatching).toBe(false);
      expect(research?.requiresApproval).toBe(true);
      expect(research?.defaultLevel).toBe('normal');
    });

    it('should have correct public sharing configuration', () => {
      const publicShare = SHARE_TYPES.find(t => t.type === 'public');
      expect(publicShare?.allowsRawData).toBe(false);
      expect(publicShare?.allowsGeneticMatching).toBe(false);
      expect(publicShare?.requiresApproval).toBe(false);
      expect(publicShare?.defaultLevel).toBe('normal');
    });

    it('should have descriptive names', () => {
      SHARE_TYPES.forEach(type => {
        expect(type.name).toBeTruthy();
        expect(typeof type.name).toBe('string');
        expect(type.description).toBeTruthy();
        expect(typeof type.description).toBe('string');
      });
    });

    it('should have icons', () => {
      SHARE_TYPES.forEach(type => {
        expect(type.icon).toBeTruthy();
        expect(typeof type.icon).toBe('string');
      });
    });

    it('should all have expiresConfig', () => {
      SHARE_TYPES.forEach(type => {
        expect(typeof type.expiresConfig).toBe('boolean');
      });
    });
  });

  describe('Share Types Array', () => {
    it('should maintain consistent order', () => {
      expect(SHARE_TYPES[0].type).toBe('family');
      expect(SHARE_TYPES[1].type).toBe('friend');
      expect(SHARE_TYPES[2].type).toBe('healthcare');
      expect(SHARE_TYPES[3].type).toBe('research');
      expect(SHARE_TYPES[4].type).toBe('public');
    });
  });

  describe('ShareType type', () => {
    it('should accept valid share types', () => {
      const validTypes: ShareType[] = ['family', 'friend', 'healthcare', 'research', 'public'];

      validTypes.forEach(type => {
        expect(['family', 'friend', 'healthcare', 'research', 'public']).toContain(type);
      });
    });
  });
});
