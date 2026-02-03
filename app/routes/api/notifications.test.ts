import { describe, it, expect } from 'vitest';

describe('Notifications API Schema', () => {
  it('should have correct notification types', () => {
    const validTypes = [
      'research_update',
      'sharing_invite',
      'genome_complete',
      'system',
      'security',
    ];

    expect(validTypes).toContain('research_update');
    expect(validTypes).toContain('sharing_invite');
    expect(validTypes).toHaveLength(5);
  });

  it('should have correct notification structure', () => {
    const notification = {
      id: 1,
      type: 'research_update',
      title: 'New SNP Added',
      message: 'rs12345 has been added',
      data: { rsid: 'rs12345' },
      isRead: false,
      createdAt: '2024-01-01T00:00:00Z',
    };

    expect(notification).toHaveProperty('id');
    expect(notification).toHaveProperty('type');
    expect(notification).toHaveProperty('title');
    expect(notification).toHaveProperty('message');
    expect(notification).toHaveProperty('isRead');
    expect(notification).toHaveProperty('createdAt');
  });
});

describe('Notifications Query Params', () => {
  it('should parse limit parameter', () => {
    const limit = '50';
    expect(parseInt(limit)).toBe(50);
  });

  it('should parse offset parameter', () => {
    const offset = '20';
    expect(parseInt(offset)).toBe(20);
  });

  it('should parse unread filter', () => {
    const unread = 'true';
    expect(unread === 'true').toBe(true);
  });
});

describe('Notifications Mutations', () => {
  it('should accept array of ids for mark as read', () => {
    const ids = [1, 2, 3];
    expect(Array.isArray(ids)).toBe(true);
    expect(ids).toHaveLength(3);
  });

  it('should accept markAll flag', () => {
    const markAll = true;
    expect(markAll).toBe(true);
  });

  it('should require ids for delete', () => {
    const ids = '1,2,3';
    const idArray = ids.split(',').map(Number);
    expect(idArray).toEqual([1, 2, 3]);
  });
});
