/**
 * Sensitive Data Tests
 * 
 * Tests for sensitive data handling and privacy settings.
 */

import { describe, it, expect } from 'vitest';
import {
  SENSITIVITY_CATEGORIES,
  SHARE_LEVELS,
  type SensitivityLevel,
  type ShareLevel,
  type SensitivityCategory,
} from './sensitive-data';

describe('Sensitive Data', () => {
  describe('SENSITIVITY_CATEGORIES', () => {
    it('should be an array', () => {
      expect(Array.isArray(SENSITIVITY_CATEGORIES)).toBe(true);
    });

    it('should have sensitivity categories', () => {
      expect(SENSITIVITY_CATEGORIES.length).toBeGreaterThan(0);
    });

    it('should have categories with required properties', () => {
      SENSITIVITY_CATEGORIES.forEach((category: SensitivityCategory) => {
        expect(category.id).toBeTruthy();
        expect(category.name).toBeTruthy();
        expect(category.description).toBeTruthy();
        expect(category.level).toBeTruthy();
        expect(Array.isArray(category.examples)).toBe(true);
        expect(typeof category.requiresDisclaimer).toBe('boolean');
      });
    });

    it('should include carrier status category', () => {
      const carrier = SENSITIVITY_CATEGORIES.find(c => c.id === 'carrier');
      expect(carrier).toBeDefined();
      expect(carrier?.level).toBe('sensitive');
      expect(carrier?.requiresDisclaimer).toBe(true);
    });
  });

  describe('SHARE_LEVELS', () => {
    it('should have all required share levels', () => {
      expect(SHARE_LEVELS).toHaveLength(3);
      const levels = SHARE_LEVELS.map(sl => sl.level);
      expect(levels).toContain('normal');
      expect(levels).toContain('sensitive');
      expect(levels).toContain('highly_sensitive');
    });

    it('should have correct includes arrays', () => {
      const normal = SHARE_LEVELS.find(sl => sl.level === 'normal');
      expect(normal?.includes).toEqual(['normal']);

      const sensitive = SHARE_LEVELS.find(sl => sl.level === 'sensitive');
      expect(sensitive?.includes).toEqual(['normal', 'sensitive']);

      const highlySensitive = SHARE_LEVELS.find(sl => sl.level === 'highly_sensitive');
      expect(highlySensitive?.includes).toEqual(['normal', 'sensitive', 'highly_sensitive']);
    });

    it('should have descriptive names', () => {
      SHARE_LEVELS.forEach(level => {
        expect(level.name).toBeTruthy();
        expect(typeof level.name).toBe('string');
      });
    });

    it('should have descriptions', () => {
      SHARE_LEVELS.forEach(level => {
        expect(level.description).toBeTruthy();
        expect(typeof level.description).toBe('string');
      });
    });
  });

  describe('Sensitivity Level Type', () => {
    it('should accept valid sensitivity levels', () => {
      const validLevels: SensitivityLevel[] = [
        'normal',
        'sensitive',
        'highly_sensitive',
      ];

      validLevels.forEach(level => {
        expect(['normal', 'sensitive', 'highly_sensitive']).toContain(level);
      });
    });
  });

  describe('ShareLevel Type', () => {
    it('should have correct structure', () => {
      const shareLevel: ShareLevel = {
        level: 'normal',
        name: 'Test Level',
        description: 'Test description',
        includes: ['normal'],
      };

      expect(shareLevel.level).toBe('normal');
      expect(shareLevel.includes).toContain('normal');
    });
  });
});
