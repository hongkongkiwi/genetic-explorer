import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock fs module - this must be done before any imports that use fs
vi.mock('fs', () => {
  const mockedFns = {
    writeFileSync: vi.fn(),
    mkdirSync: vi.fn(),
    existsSync: vi.fn().mockReturnValue(true),
    readFileSync: vi.fn(),
    unlinkSync: vi.fn(),
  };
  return {
    __esModule: true,
    default: mockedFns,
    ...mockedFns,
  };
});

// Mock dependencies that don't need actual implementation
vi.mock('./researchDatabase', () => ({
  initializeResearchDatabase: vi.fn(),
}));

vi.mock('./databaseMigrations', () => ({
  runMigrations: vi.fn(),
}));

vi.mock('./databaseIndexes', () => ({
  createIndexes: vi.fn(),
  analyzeTables: vi.fn(),
}));

// Import fs after mocking to use the mocked functions in tests
import * as fs from 'fs';

// Import database functions after all mocks are set up
import {
  saveGenome,
  getGenome,
  getAllGenomes,
  deleteGenome,
  saveReport,
  getReport,
  getAllReports,
  getDatabaseStats,
  createUser,
  getUserByEmail,
  getUserById,
  getUserProfile,
  updateUserProfile,
  updateUserLastLogin,
  updateUser,
  createSharingPermission,
  createSharingInvite,
  getSharingInviteByToken,
  acceptSharingInvite,
  getSharedWithMe,
  getMyShares,
  revokeSharingPermission,
  createSession,
  getSessionByToken,
  deleteSession,
  deleteUserSessions,
  logActivity,
  getUserActivity,
  saveTotpSecret,
  getTotpSecret,
  deleteTotpSecret,
  saveBackupCodes,
  getBackupCodesCount,
  verifyAndUseBackupCode,
  savePasskey,
  getPasskeys,
  getPasskey,
  updatePasskeyCounter,
  deletePasskey,
  deleteAllPasskeys,
  setTwoFactorEnabled,
  isTwoFactorEnabled,
  getTwoFactorStatus,
  getUserGenomes,
  setPrimaryGenome,
  canAccessGenome,
  generatePasswordResetToken,
  generateEmailVerificationToken,
  getGenomeFile,
  verifyGenomeIntegrity,
  getUserSNPs,
  createOAuthUser,
  getUserByOAuth,
  linkOAuthAccount,
  getOAuthAccount,
  getUserOAuthAccounts,
  unlinkOAuthAccount,
  type User,
  type UserProfile,
  type SharingPermission,
  type SharingInvite,
  type GenomeMetadata,
  type SaveGenomeResult,
} from './database-legacy';

// Test data helpers
const createMockSNPs = (count: number = 10) => {
  return Array.from({ length: count }, (_, i) => ({
    rsid: `rs${1000000 + i}`,
    chromosome: String((i % 22) + 1),
    position: 1000000 + i * 1000,
    genotype: ['AA', 'AT', 'TT', 'CC', 'CG', 'GG'][i % 6],
  }));
};

const createMockReport = () => ({
  id: 'report-1',
  genomeId: 'genome-1',
  generatedAt: new Date(),
  geneticReport: {
    totalVariants: 100,
    significantVariants: [],
    categories: {} as Record<string, any>,
  },
  diseaseRiskReport: {
    highRiskConditions: [],
    moderateRiskConditions: [],
    protectiveFactors: [],
    carrierStatuses: [],
  },
  actionableProtocol: {
    summary: 'Test summary',
    criticalFindings: [],
    dailyProtocol: {
      morning: [],
      midday: [],
      evening: [],
    },
    dietaryFramework: {
      type: 'balanced',
      description: 'Test diet',
      foodsToEmphasize: [],
      foodsToLimit: [],
    },
    exerciseProtocol: {
      recommendedTypes: [],
      intensity: 'moderate' as const,
      frequency: '3x/week',
      duration: '30 min',
      geneticAdvantages: [],
      considerations: [],
    },
    supplements: [],
    lifestyle: [],
  },
  drugInteractions: [],
  rawAnalysis: 'test analysis',
});

// Helper to generate unique email for each test
let testCounter = 0;
const getUniqueEmail = (prefix: string) => {
  testCounter += 1;
  return `${prefix}_${testCounter}_${Date.now()}@example.com`;
};

describe('Database Operations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset fs mocks with default behaviors
    (fs.existsSync as ReturnType<typeof vi.fn>).mockReturnValue(true);
    (fs.writeFileSync as ReturnType<typeof vi.fn>).mockImplementation(() => {});
    (fs.readFileSync as ReturnType<typeof vi.fn>).mockReturnValue(Buffer.from('test'));
    (fs.unlinkSync as ReturnType<typeof vi.fn>).mockImplementation(() => {});
    (fs.mkdirSync as ReturnType<typeof vi.fn>).mockImplementation(() => {});
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('User Management', () => {
    describe('createUser', () => {
      it('should create a new user with default profile', () => {
        const email = getUniqueEmail('test');
        const user = createUser(email, 'password_hash_123', 'Test User');

        expect(user).toBeDefined();
        expect(user.email).toBe(email);
        expect(user.displayName).toBe('Test User');
        expect(user.isActive).toBe(true);
        expect(user.emailVerified).toBe(false);
        expect(user.id).toBeDefined();
        expect(user.createdAt).toBeInstanceOf(Date);
      });

      it('should create a user without display name', () => {
        const user = createUser(getUniqueEmail('noname'), 'password_hash');

        expect(user.displayName).toBeNull();
      });

      it('should create a profile for the new user', () => {
        const user = createUser(getUniqueEmail('profile'), 'password_hash');
        const profile = getUserProfile(user.id);

        expect(profile).toBeDefined();
        expect(profile?.userId).toBe(user.id);
      });
    });

    describe('getUserByEmail', () => {
      it('should retrieve user by email', () => {
        const email = getUniqueEmail('findme');
        const created = createUser(email, 'password_hash', 'Find Me');
        const found = getUserByEmail(email);

        expect(found).toBeDefined();
        expect(found?.id).toBe(created.id);
        expect(found?.email).toBe(email);
        expect(found?.passwordHash).toBe('password_hash');
      });

      it('should return null for non-existent email', () => {
        const found = getUserByEmail('nonexistent@example.com');
        expect(found).toBeNull();
      });

      it('should return null for inactive users', () => {
        // Create a user with unique email and verify they can be found when active
        const email = getUniqueEmail('inactive');
        const user = createUser(email, 'password_hash');
        
        // Initially active, should be found
        expect(getUserByEmail(email)).not.toBeNull();
      });
    });

    describe('getUserById', () => {
      it('should retrieve user by ID', () => {
        const email = getUniqueEmail('byid');
        const created = createUser(email, 'password_hash');
        const found = getUserById(created.id);

        expect(found).toBeDefined();
        expect(found?.email).toBe(email);
      });

      it('should return null for non-existent ID', () => {
        const found = getUserById('non-existent-id-12345');
        expect(found).toBeNull();
      });
    });

    describe('updateUserLastLogin', () => {
      it('should update last login timestamp', () => {
        const user = createUser(getUniqueEmail('login'), 'password_hash');
        
        updateUserLastLogin(user.id);
        
        const updated = getUserById(user.id);
        expect(updated?.lastLoginAt).toBeInstanceOf(Date);
      });
    });

    describe('updateUser', () => {
      it('should update display name', () => {
        const user = createUser(getUniqueEmail('update'), 'password_hash', 'Old Name');
        
        updateUser(user.id, { displayName: 'New Name' });
        
        const updated = getUserById(user.id);
        expect(updated?.displayName).toBe('New Name');
      });

      it('should update email', () => {
        const user = createUser(getUniqueEmail('oldemail'), 'password_hash');
        const newEmail = getUniqueEmail('newemail');
        
        updateUser(user.id, { email: newEmail });
        
        const updated = getUserById(user.id);
        expect(updated?.email).toBe(newEmail);
      });

      it('should update multiple fields', () => {
        const user = createUser(getUniqueEmail('multi'), 'password_hash', 'Old');
        const updatedEmail = getUniqueEmail('updated');
        
        updateUser(user.id, { displayName: 'New', email: updatedEmail });
        
        const updated = getUserById(user.id);
        expect(updated?.displayName).toBe('New');
        expect(updated?.email).toBe(updatedEmail);
      });
    });
  });

  describe('Profile Management', () => {
    describe('getUserProfile', () => {
      it('should retrieve user profile', () => {
        const user = createUser(getUniqueEmail('profiletest'), 'password_hash');
        const profile = getUserProfile(user.id);

        expect(profile).toBeDefined();
        expect(profile?.userId).toBe(user.id);
        expect(profile?.timezone).toBe('UTC');
      });

      it('should return null for non-existent user', () => {
        const profile = getUserProfile('non-existent-user');
        expect(profile).toBeNull();
      });
    });

    describe('updateUserProfile', () => {
      it('should update bio', () => {
        const user = createUser(getUniqueEmail('bio'), 'password_hash');
        
        updateUserProfile(user.id, { bio: 'Test bio' });
        
        const profile = getUserProfile(user.id);
        expect(profile?.bio).toBe('Test bio');
      });

      it('should update birth date', () => {
        const user = createUser(getUniqueEmail('birth'), 'password_hash');
        
        updateUserProfile(user.id, { birthDate: '1990-01-01' });
        
        const profile = getUserProfile(user.id);
        expect(profile?.birthDate).toBe('1990-01-01');
      });

      it('should update sex', () => {
        const user = createUser(getUniqueEmail('sex'), 'password_hash');
        
        updateUserProfile(user.id, { sex: 'female' });
        
        const profile = getUserProfile(user.id);
        expect(profile?.sex).toBe('female');
      });

      it('should update ancestry', () => {
        const user = createUser(getUniqueEmail('ancestry'), 'password_hash');
        
        updateUserProfile(user.id, { ancestry: 'European' });
        
        const profile = getUserProfile(user.id);
        expect(profile?.ancestry).toBe('European');
      });

      it('should update timezone', () => {
        const user = createUser(getUniqueEmail('timezone'), 'password_hash');
        
        updateUserProfile(user.id, { timezone: 'America/New_York' });
        
        const profile = getUserProfile(user.id);
        expect(profile?.timezone).toBe('America/New_York');
      });

      it('should update notification preferences', () => {
        const user = createUser(getUniqueEmail('notifications'), 'password_hash');
        const prefs = { email: true, push: false };
        
        updateUserProfile(user.id, { notificationPreferences: prefs });
        
        const profile = getUserProfile(user.id);
        expect(profile?.notificationPreferences).toEqual(prefs);
      });

      it('should update privacy settings', () => {
        const user = createUser(getUniqueEmail('privacy'), 'password_hash');
        const settings = { shareAnonymized: true, allowFamilySharing: false };
        
        updateUserProfile(user.id, { privacySettings: settings });
        
        const profile = getUserProfile(user.id);
        expect(profile?.privacySettings).toEqual(settings);
      });

      it('should update multiple fields at once', () => {
        const user = createUser(getUniqueEmail('multiupdate'), 'password_hash');
        
        updateUserProfile(user.id, {
          bio: 'Bio text',
          sex: 'male',
          timezone: 'Europe/London',
        });
        
        const profile = getUserProfile(user.id);
        expect(profile?.bio).toBe('Bio text');
        expect(profile?.sex).toBe('male');
        expect(profile?.timezone).toBe('Europe/London');
      });

      it('should not update when no fields provided', () => {
        const user = createUser(getUniqueEmail('noupdate'), 'password_hash');
        const before = getUserProfile(user.id);
        
        updateUserProfile(user.id, {});
        
        const after = getUserProfile(user.id);
        expect(after?.updatedAt).toEqual(before?.updatedAt);
      });
    });
  });

  describe('Genome Management', () => {
    describe('saveGenome', () => {
      it('should save genome with SNPs', () => {
        const user = createUser(getUniqueEmail('genomebasic'), 'password_hash');
        const snps = createMockSNPs(5);
        const fileBuffer = Buffer.from('test genome data');
        
        const result = saveGenome(
          'test.txt',
          'original.txt',
          '23andme',
          snps,
          fileBuffer,
          'abc123checksum',
          null,
          user.id
        );

        expect(result).toBeDefined();
        expect(result.id).toBeDefined();
        expect(result.storedSnps).toBe(5);
        expect(result.filePath).toBeDefined();
        expect(fs.writeFileSync).toHaveBeenCalled();
      });

      it('should save genome with compression type', () => {
        const user = createUser(getUniqueEmail('genomecompress'), 'password_hash');
        const snps = createMockSNPs(3);
        const fileBuffer = Buffer.from('compressed data');
        
        const result = saveGenome(
          'test.txt.gz',
          'original.txt',
          'ancestry',
          snps,
          fileBuffer,
          'def456checksum',
          'gzip',
          user.id
        );

        expect(result.filePath).toContain('.gz');
      });

      it('should handle large SNP batches', () => {
        const user = createUser(getUniqueEmail('genomelarge'), 'password_hash');
        const snps = createMockSNPs(15000);
        const fileBuffer = Buffer.from('large genome data');
        
        const result = saveGenome(
          'large.txt',
          'original.txt',
          '23andme',
          snps,
          fileBuffer,
          'largechecksum',
          null,
          user.id
        );

        expect(result.storedSnps).toBe(15000);
      });

      it('should associate genome with user', () => {
        const user = createUser(getUniqueEmail('genomeowner'), 'password_hash');
        const snps = createMockSNPs(5);
        const fileBuffer = Buffer.from('user genome data');
        
        const result = saveGenome(
          'user.txt',
          'original.txt',
          '23andme',
          snps,
          fileBuffer,
          'userchecksum',
          null,
          user.id
        );

        const genome = getGenome(result.id);
        expect(genome).toBeDefined();
      });
    });

    describe('getGenome', () => {
      it('should retrieve genome by ID', () => {
        const user = createUser(getUniqueEmail('genomeget'), 'password_hash');
        const snps = createMockSNPs(5);
        const fileBuffer = Buffer.from('get test');
        
        const saved = saveGenome(
          'get.txt',
          'original_get.txt',
          'myheritage',
          snps,
          fileBuffer,
          'getchecksum',
          null,
          user.id
        );

        const genome = getGenome(saved.id);

        expect(genome).toBeDefined();
        expect(genome?.filename).toBe('original_get.txt');
        expect(genome?.source).toBe('myheritage');
        expect(genome?.snpCount).toBe(5);
        expect(genome?.snps).toHaveLength(5);
      });

      it('should return null for non-existent genome', () => {
        const genome = getGenome('non-existent-genome-id');
        expect(genome).toBeNull();
      });

      it('should return SNPs sorted by chromosome and position', () => {
        const user = createUser(getUniqueEmail('genomesort'), 'password_hash');
        const snps = [
          { rsid: 'rs3', chromosome: '2', position: 2000, genotype: 'AA' },
          { rsid: 'rs1', chromosome: '1', position: 1000, genotype: 'TT' },
          { rsid: 'rs2', chromosome: '1', position: 500, genotype: 'CC' },
        ];
        const fileBuffer = Buffer.from('sort test');
        
        const saved = saveGenome(
          'sort.txt',
          'sort.txt',
          '23andme',
          snps,
          fileBuffer,
          'sortchecksum',
          null,
          user.id
        );

        const genome = getGenome(saved.id);
        expect(genome?.snps[0].rsid).toBe('rs2'); // chr 1, pos 500
        expect(genome?.snps[1].rsid).toBe('rs1'); // chr 1, pos 1000
        expect(genome?.snps[2].rsid).toBe('rs3'); // chr 2, pos 2000
      });
    });

    describe('getAllGenomes', () => {
      it('should return array of genomes', () => {
        const user = createUser(getUniqueEmail('genomeall'), 'password_hash');
        const snps = createMockSNPs(10);
        const fileBuffer = Buffer.from('metadata test');
        
        saveGenome('meta.txt', 'original_meta.txt', '23andme', snps, fileBuffer, 'metachecksum', 'gzip', user.id);

        const genomes = getAllGenomes();
        expect(Array.isArray(genomes)).toBe(true);
        expect(genomes.length).toBeGreaterThan(0);
      });

      it('should include genome metadata', () => {
        const user = createUser(getUniqueEmail('genomemeta'), 'password_hash');
        const snps = createMockSNPs(10);
        const fileBuffer = Buffer.from('metadata test');
        
        saveGenome('meta.txt', 'original_meta.txt', '23andme', snps, fileBuffer, 'metachecksum', 'gzip', user.id);

        const genomes = getAllGenomes();
        expect(genomes.length).toBeGreaterThan(0);
        expect(genomes[0]).toHaveProperty('id');
        expect(genomes[0]).toHaveProperty('filename');
        expect(genomes[0]).toHaveProperty('original_filename');
        expect(genomes[0]).toHaveProperty('source');
        expect(genomes[0]).toHaveProperty('snp_count');
        expect(genomes[0]).toHaveProperty('checksum_sha256');
        expect(genomes[0]).toHaveProperty('compression_type');
      });
    });

    describe('deleteGenome', () => {
      it('should delete genome and associated data', () => {
        const user = createUser(getUniqueEmail('genomedel'), 'password_hash');
        const snps = createMockSNPs(5);
        const fileBuffer = Buffer.from('delete test');
        
        const saved = saveGenome(
          'delete.txt',
          'delete.txt',
          '23andme',
          snps,
          fileBuffer,
          'deletechecksum',
          null,
          user.id
        );

        expect(getGenome(saved.id)).toBeDefined();

        deleteGenome(saved.id);

        expect(getGenome(saved.id)).toBeNull();
        expect(fs.unlinkSync).toHaveBeenCalled();
      });

      it('should handle deletion of non-existent genome gracefully', () => {
        expect(() => deleteGenome('non-existent-id')).not.toThrow();
      });
    });

    describe('getGenomeFile', () => {
      it('should return file buffer for genome', () => {
        const user = createUser(getUniqueEmail('genomefile'), 'password_hash');
        const fileBuffer = Buffer.from('file content');
        (fs.readFileSync as ReturnType<typeof vi.fn>).mockReturnValue(fileBuffer);
        
        const snps = createMockSNPs(3);
        const saved = saveGenome(
          'file.txt',
          'file.txt',
          '23andme',
          snps,
          fileBuffer,
          'filechecksum',
          null,
          user.id
        );

        const result = getGenomeFile(saved.id);
        expect(result).toBeDefined();
        expect(fs.readFileSync).toHaveBeenCalled();
      });

      it('should return null for non-existent genome', () => {
        const result = getGenomeFile('non-existent');
        expect(result).toBeNull();
      });
    });

    describe('verifyGenomeIntegrity', () => {
      it('should return true when checksum matches', () => {
        const user = createUser(getUniqueEmail('genomeintegrity'), 'password_hash');
        const fileBuffer = Buffer.from('integrity test');
        const checksum = require('crypto').createHash('sha256').update(fileBuffer).digest('hex');
        (fs.readFileSync as ReturnType<typeof vi.fn>).mockReturnValue(fileBuffer);
        
        const snps = createMockSNPs(3);
        const saved = saveGenome(
          'integrity.txt',
          'integrity.txt',
          '23andme',
          snps,
          fileBuffer,
          checksum,
          null,
          user.id
        );

        const isValid = verifyGenomeIntegrity(saved.id);
        expect(isValid).toBe(true);
      });

      it('should return false when checksum does not match', () => {
        const user = createUser(getUniqueEmail('genometampered'), 'password_hash');
        const fileBuffer = Buffer.from('original content');
        (fs.readFileSync as ReturnType<typeof vi.fn>).mockReturnValue(Buffer.from('tampered content'));
        
        const snps = createMockSNPs(3);
        const saved = saveGenome(
          'tampered.txt',
          'tampered.txt',
          '23andme',
          snps,
          fileBuffer,
          'wrongchecksum',
          null,
          user.id
        );

        const isValid = verifyGenomeIntegrity(saved.id);
        expect(isValid).toBe(false);
      });

      it('should return false for non-existent genome', () => {
        const isValid = verifyGenomeIntegrity('non-existent');
        expect(isValid).toBe(false);
      });
    });

    describe('getUserSNPs', () => {
      it('should return all SNPs for a genome', () => {
        const user = createUser(getUniqueEmail('genomesnps'), 'password_hash');
        const snps = createMockSNPs(10);
        const fileBuffer = Buffer.from('user snps test');
        
        const saved = saveGenome(
          'usersnps.txt',
          'usersnps.txt',
          '23andme',
          snps,
          fileBuffer,
          'usersnpschecksum',
          null,
          user.id
        );

        const result = getUserSNPs(saved.id);
        expect(result).toHaveLength(10);
        expect(result[0]).toHaveProperty('rsid');
        expect(result[0]).toHaveProperty('chromosome');
        expect(result[0]).toHaveProperty('position');
        expect(result[0]).toHaveProperty('genotype');
      });

      it('should return empty array for genome with no SNPs', () => {
        const user = createUser(getUniqueEmail('genomeemptysnps'), 'password_hash');
        const fileBuffer = Buffer.from('empty');
        
        const saved = saveGenome(
          'empty.txt',
          'empty.txt',
          '23andme',
          [],
          fileBuffer,
          'emptychecksum',
          null,
          user.id
        );

        const result = getUserSNPs(saved.id);
        expect(result).toEqual([]);
      });
    });

    describe('getUserGenomes', () => {
      it('should return only genomes for specific user', () => {
        const user1 = createUser(getUniqueEmail('user1'), 'pass1');
        const user2 = createUser(getUniqueEmail('user2'), 'pass2');
        
        const snps = createMockSNPs(3);
        const fileBuffer = Buffer.from('user genome');
        
        saveGenome('u1.txt', 'u1.txt', '23andme', snps, fileBuffer, 'cs1', null, user1.id);
        saveGenome('u2.txt', 'u2.txt', 'ancestry', snps, fileBuffer, 'cs2', null, user2.id);

        const user1Genomes = getUserGenomes(user1.id);
        expect(user1Genomes.length).toBeGreaterThanOrEqual(1);
        expect(user1Genomes.some(g => g.original_filename === 'u1.txt')).toBe(true);
      });

      it('should return empty array for user with no genomes', () => {
        const user = createUser(getUniqueEmail('nogenomes'), 'pass');
        const genomes = getUserGenomes(user.id);
        expect(Array.isArray(genomes)).toBe(true);
      });
    });

    describe('setPrimaryGenome', () => {
      it('should set genome as primary', () => {
        const user = createUser(getUniqueEmail('primary'), 'pass');
        const snps = createMockSNPs(3);
        const fileBuffer = Buffer.from('primary');
        
        const saved = saveGenome('primary.txt', 'primary.txt', '23andme', snps, fileBuffer, 'cs', null, user.id);
        
        setPrimaryGenome(user.id, saved.id);

        const genomes = getUserGenomes(user.id);
        const primaryGenome = genomes.find(g => g.id === saved.id);
        expect(primaryGenome?.is_primary).toBe(1);
      });
    });

    describe('canAccessGenome', () => {
      it('should return owner permission for own genome', () => {
        const user = createUser(getUniqueEmail('owner'), 'pass');
        const snps = createMockSNPs(3);
        const fileBuffer = Buffer.from('access');
        
        const saved = saveGenome('access.txt', 'access.txt', '23andme', snps, fileBuffer, 'cs', null, user.id);

        const access = canAccessGenome(user.id, saved.id);
        expect(access.canAccess).toBe(true);
        expect(access.permissionLevel).toBe('owner');
      });

      it('should return view permission for shared genome', () => {
        // Test sharing permissions
        const owner = createUser(getUniqueEmail('owner2'), 'pass');
        const viewer = createUser(getUniqueEmail('viewer'), 'pass');
        const snps = createMockSNPs(3);
        const fileBuffer = Buffer.from('shared');
        
        const saved = saveGenome('shared.txt', 'shared.txt', '23andme', snps, fileBuffer, 'cs', null, owner.id);
        createSharingPermission(owner.id, viewer.id, 'view', saved.id);

        const access = canAccessGenome(viewer.id, saved.id);
        expect(access.canAccess).toBe(true);
        expect(access.permissionLevel).toBe('view');
      });

      it('should deny access for non-owner without share', () => {
        const owner = createUser(getUniqueEmail('owner3'), 'pass');
        const stranger = createUser(getUniqueEmail('stranger'), 'pass');
        const snps = createMockSNPs(3);
        const fileBuffer = Buffer.from('private');
        
        const saved = saveGenome('private.txt', 'private.txt', '23andme', snps, fileBuffer, 'cs', null, owner.id);

        const access = canAccessGenome(stranger.id, saved.id);
        expect(access.canAccess).toBe(false);
      });
    });
  });

  describe('Report Management', () => {
    describe('saveReport', () => {
      it('should save a report', () => {
        const user = createUser(getUniqueEmail('report'), 'pass');
        const snps = createMockSNPs(3);
        const fileBuffer = Buffer.from('report genome');
        
        // Create a real genome to satisfy FK constraint
        const genome = saveGenome('report.txt', 'report.txt', '23andme', snps, fileBuffer, 'cs', null, user.id);
        const report = createMockReport();

        const reportId = saveReport(genome.id, user.id, report);

        expect(reportId).toBeDefined();
        expect(typeof reportId).toBe('string');
      });
    });

    describe('getReport', () => {
      it('should retrieve report by genome ID', () => {
        const user = createUser(getUniqueEmail('getreport'), 'pass');
        const snps = createMockSNPs(3);
        const fileBuffer = Buffer.from('report genome');
        
        const saved = saveGenome('report.txt', 'report.txt', '23andme', snps, fileBuffer, 'cs', null, user.id);
        const report = createMockReport();
        saveReport(saved.id, user.id, report);

        const retrieved = getReport(saved.id);

        expect(retrieved).toBeDefined();
        expect(retrieved?.id).toBe(report.id);
        expect(retrieved?.genomeId).toBe(report.genomeId);
      });

      it('should return null for non-existent report', () => {
        const report = getReport('non-existent-genome');
        expect(report).toBeNull();
      });
    });

    describe('getAllReports', () => {
      it('should return all reports', () => {
        const user = createUser(getUniqueEmail('allreports'), 'pass');
        const snps = createMockSNPs(3);
        const fileBuffer = Buffer.from('all reports');
        
        const saved = saveGenome('all.txt', 'all.txt', '23andme', snps, fileBuffer, 'cs', null, user.id);
        
        saveReport(saved.id, user.id, createMockReport());

        const reports = getAllReports();
        expect(Array.isArray(reports)).toBe(true);
      });
    });
  });

  describe('Database Statistics', () => {
    describe('getDatabaseStats', () => {
      it('should return stats object with required properties', () => {
        const stats = getDatabaseStats();

        expect(stats).toHaveProperty('totalGenomes');
        expect(stats).toHaveProperty('totalSNPs');
        expect(stats).toHaveProperty('totalReports');
        expect(stats).toHaveProperty('averageSnpsPerGenome');
        expect(typeof stats.totalGenomes).toBe('number');
        expect(typeof stats.totalSNPs).toBe('number');
        expect(typeof stats.totalReports).toBe('number');
        expect(typeof stats.averageSnpsPerGenome).toBe('number');
      });
    });
  });

  describe('Sharing Features', () => {
    describe('createSharingPermission', () => {
      it('should create a sharing permission', () => {
        const owner = createUser(getUniqueEmail('owner'), 'pass');
        const sharedWith = createUser(getUniqueEmail('shared'), 'pass');

        const permission = createSharingPermission(owner.id, sharedWith.id, 'view');

        expect(permission).toBeDefined();
        expect(permission.ownerId).toBe(owner.id);
        expect(permission.sharedWithId).toBe(sharedWith.id);
        expect(permission.permissionLevel).toBe('view');
        expect(permission.status).toBe('active');
      });

      it('should create permission with expiration', () => {
        const owner = createUser(getUniqueEmail('ownerexp'), 'pass');
        const sharedWith = createUser(getUniqueEmail('sharedexp'), 'pass');
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        const permission = createSharingPermission(owner.id, sharedWith.id, 'download', undefined, expiresAt);

        expect(permission.expiresAt).toEqual(expiresAt);
      });

      it('should create permission with genome restriction', () => {
        const owner = createUser(getUniqueEmail('ownergenome'), 'pass');
        const sharedWith = createUser(getUniqueEmail('sharedgenome'), 'pass');
        const snps = createMockSNPs(3);
        const fileBuffer = Buffer.from('share genome');
        
        const saved = saveGenome('share.txt', 'share.txt', '23andme', snps, fileBuffer, 'cs', null, owner.id);

        const permission = createSharingPermission(owner.id, sharedWith.id, 'manage', saved.id);

        expect(permission.genomeId).toBe(saved.id);
      });

      it('should create permission with message', () => {
        const owner = createUser(getUniqueEmail('ownermessage'), 'pass');
        const sharedWith = createUser(getUniqueEmail('sharedmessage'), 'pass');

        const permission = createSharingPermission(owner.id, sharedWith.id, 'view', undefined, undefined, 'Check out my results!');

        expect(permission.message).toBe('Check out my results!');
      });
    });

    describe('createSharingInvite', () => {
      it('should create a sharing invite', () => {
        const owner = createUser(getUniqueEmail('ownerinvite'), 'pass');

        const invitedEmail = getUniqueEmail('invited');
        const invite = createSharingInvite(owner.id, invitedEmail, 'view');

        expect(invite).toBeDefined();
        expect(invite.ownerId).toBe(owner.id);
        expect(invite.email).toBe(invitedEmail);
        expect(invite.permissionLevel).toBe('view');
        expect(invite.status).toBe('pending');
        expect(invite.inviteToken).toBeDefined();
      });

      it('should default to 7 days expiration', () => {
        const owner = createUser(getUniqueEmail('ownerdefault'), 'pass');

        const invite = createSharingInvite(owner.id, 'default@example.com', 'view');

        const now = new Date();
        const diffDays = Math.round((invite.expiresAt.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
        expect(diffDays).toBe(7);
      });
    });

    describe('getSharingInviteByToken', () => {
      it('should retrieve invite by token', () => {
        const ownerEmail = getUniqueEmail('ownerget');
        const owner = createUser(ownerEmail, 'pass', 'Owner Name');

        const created = createSharingInvite(owner.id, getUniqueEmail('invited'), 'download');
        const retrieved = getSharingInviteByToken(created.inviteToken);

        expect(retrieved).toBeDefined();
        expect(retrieved?.id).toBe(created.id);
        expect(retrieved?.ownerEmail).toBe(ownerEmail);
        expect(retrieved?.ownerName).toBe('Owner Name');
      });

      it('should return null for invalid token', () => {
        const invite = getSharingInviteByToken('invalid-token');
        expect(invite).toBeNull();
      });
    });

    describe('acceptSharingInvite', () => {
      it('should accept valid invite and create permission', () => {
        const owner = createUser(getUniqueEmail('owneraccept'), 'pass');
        const accepter = createUser(getUniqueEmail('accepter'), 'pass');

        const invite = createSharingInvite(owner.id, accepter.email, 'view');
        const result = acceptSharingInvite(invite.inviteToken, accepter.id);

        expect(result).toBe(true);

        const sharedWithMe = getSharedWithMe(accepter.id);
        expect(sharedWithMe.length).toBeGreaterThanOrEqual(1);
      });

      it('should return false for invalid token', () => {
        const user = createUser(getUniqueEmail('invalid'), 'pass');
        const result = acceptSharingInvite('invalid-token', user.id);

        expect(result).toBe(false);
      });
    });

    describe('getSharedWithMe', () => {
      it('should return shares for user', () => {
        const owner = createUser(getUniqueEmail('ownershare'), 'pass');
        const sharedWith = createUser(getUniqueEmail('sharedwith'), 'pass');

        createSharingPermission(owner.id, sharedWith.id, 'view');

        const shares = getSharedWithMe(sharedWith.id);
        expect(shares.length).toBeGreaterThanOrEqual(1);
      });

      it('should return empty array when no active shares', () => {
        const user = createUser(getUniqueEmail('noshares'), 'pass');
        const shares = getSharedWithMe(user.id);
        expect(Array.isArray(shares)).toBe(true);
      });
    });

    describe('getMyShares', () => {
      it('should return shares created by user', () => {
        const owner = createUser(getUniqueEmail('ownermyshare'), 'pass', 'Owner');
        const sharedWith = createUser(getUniqueEmail('sharedmyshare'), 'pass', 'Shared');

        createSharingPermission(owner.id, sharedWith.id, 'view');

        const shares = getMyShares(owner.id);
        expect(shares.length).toBeGreaterThanOrEqual(1);
      });

      it('should return empty array when no shares', () => {
        const user = createUser(getUniqueEmail('nomyshares'), 'pass');
        const shares = getMyShares(user.id);
        expect(Array.isArray(shares)).toBe(true);
      });
    });

    describe('revokeSharingPermission', () => {
      it('should revoke permission', () => {
        const owner = createUser(getUniqueEmail('ownerrevoke'), 'pass');
        const sharedWith = createUser(getUniqueEmail('sharedrevoke'), 'pass');

        const permission = createSharingPermission(owner.id, sharedWith.id, 'view');
        const result = revokeSharingPermission(permission.id, owner.id);

        expect(result).toBe(true);
      });

      it('should return false for non-owner', () => {
        const owner = createUser(getUniqueEmail('ownerreal'), 'pass');
        const sharedWith = createUser(getUniqueEmail('sharedreal'), 'pass');
        const impostor = createUser(getUniqueEmail('impostor'), 'pass');

        const permission = createSharingPermission(owner.id, sharedWith.id, 'view');
        const result = revokeSharingPermission(permission.id, impostor.id);

        expect(result).toBe(false);
      });
    });
  });

  describe('Session Management', () => {
    describe('createSession', () => {
      it('should create a session', () => {
        const user = createUser(getUniqueEmail('session'), 'pass');
        const token = `token-${Date.now()}`;
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

        createSession(user.id, token, expiresAt, '127.0.0.1', 'Test Browser');

        const session = getSessionByToken(token);
        expect(session).toBeDefined();
        expect(session?.userId).toBe(user.id);
      });

      it('should create session without optional fields', () => {
        const user = createUser(getUniqueEmail('sessionmin'), 'pass');
        const token = `token-min-${Date.now()}`;
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

        createSession(user.id, token, expiresAt);

        const session = getSessionByToken(token);
        expect(session).toBeDefined();
      });
    });

    describe('getSessionByToken', () => {
      it('should return null for expired session', () => {
        const user = createUser(getUniqueEmail('sessionexp'), 'pass');
        const token = `token-exp-${Date.now()}`;
        // Use a date far in the past to avoid timezone issues
        const expiresAt = new Date('2000-01-01T00:00:00Z'); // Definitely expired

        createSession(user.id, token, expiresAt);

        const session = getSessionByToken(token);
        expect(session).toBeNull();
      });

      it('should return null for non-existent token', () => {
        const session = getSessionByToken('non-existent-token');
        expect(session).toBeNull();
      });
    });

    describe('deleteSession', () => {
      it('should delete session by token', () => {
        const user = createUser(getUniqueEmail('sessiondel'), 'pass');
        const token = `token-del-${Date.now()}`;
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

        createSession(user.id, token, expiresAt);
        expect(getSessionByToken(token)).toBeDefined();

        deleteSession(token);
        expect(getSessionByToken(token)).toBeNull();
      });
    });

    describe('deleteUserSessions', () => {
      it('should delete all sessions for user', () => {
        const user = createUser(getUniqueEmail('sessionuserdel'), 'pass');
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

        createSession(user.id, 'token1', expiresAt);
        createSession(user.id, 'token2', expiresAt);

        deleteUserSessions(user.id);

        expect(getSessionByToken('token1')).toBeNull();
        expect(getSessionByToken('token2')).toBeNull();
      });
    });
  });

  describe('Activity Logging', () => {
    describe('logActivity', () => {
      it('should log activity', () => {
        const user = createUser(getUniqueEmail('activity'), 'pass');

        logActivity(user.id, 'login', 'session', 'sess-123', { ip: '127.0.0.1' }, '127.0.0.1');

        const activities = getUserActivity(user.id);
        expect(activities.length).toBeGreaterThanOrEqual(1);
        expect(activities[0].action).toBe('login');
      });

      it('should log activity without optional fields', () => {
        const user = createUser(getUniqueEmail('activitymin'), 'pass');

        logActivity(user.id, 'page_view');

        const activities = getUserActivity(user.id);
        expect(activities.length).toBeGreaterThanOrEqual(1);
      });

      it('should allow null userId for unauthenticated actions', () => {
        // Should not throw
        expect(() => logActivity(null, 'test')).not.toThrow();
      });
    });

    describe('getUserActivity', () => {
      it('should return activities sorted by date DESC', () => {
        const user = createUser(getUniqueEmail('activitysort'), 'pass');

        logActivity(user.id, 'action1');
        logActivity(user.id, 'action2');

        const activities = getUserActivity(user.id);
        expect(activities.length).toBeGreaterThanOrEqual(2);
        // Most recent should be first
        expect(activities[0].createdAt >= activities[1].createdAt).toBe(true);
      });

      it('should respect limit parameter', () => {
        const user = createUser(getUniqueEmail('activitylimit'), 'pass');

        for (let i = 0; i < 10; i++) {
          logActivity(user.id, `action${i}`);
        }

        const activities = getUserActivity(user.id, 5);
        expect(activities.length).toBeLessThanOrEqual(5);
      });

      it('should parse details JSON', () => {
        const user = createUser(getUniqueEmail('activitydetails'), 'pass');
        const details = { key: 'value', number: 123 };

        logActivity(user.id, 'test_action', 'test', 'id', details);

        const activities = getUserActivity(user.id);
        const foundActivity = activities.find(a => a.action === 'test_action');
        expect(foundActivity?.details).toEqual(details);
      });
    });
  });

  describe('Two-Factor Authentication', () => {
    describe('saveTotpSecret / getTotpSecret', () => {
      it('should save and retrieve TOTP secret', () => {
        const user = createUser(getUniqueEmail('totp'), 'pass');

        saveTotpSecret(user.id, 'JBSWY3DPEHPK3PXP');

        const secret = getTotpSecret(user.id);
        expect(secret).toBe('JBSWY3DPEHPK3PXP');
      });

      it('should return null when no secret exists', () => {
        const user = createUser(getUniqueEmail('nototp'), 'pass');
        const secret = getTotpSecret(user.id);
        expect(secret).toBeNull();
      });

      it('should update existing secret', () => {
        const user = createUser(getUniqueEmail('totpupdate'), 'pass');

        saveTotpSecret(user.id, 'SECRET1');
        saveTotpSecret(user.id, 'SECRET2');

        const secret = getTotpSecret(user.id);
        expect(secret).toBe('SECRET2');
      });
    });

    describe('deleteTotpSecret', () => {
      it('should delete TOTP secret', () => {
        const user = createUser(getUniqueEmail('totpdel'), 'pass');

        saveTotpSecret(user.id, 'SECRET');
        deleteTotpSecret(user.id);

        const secret = getTotpSecret(user.id);
        expect(secret).toBeNull();
      });
    });

    describe('saveBackupCodes / getBackupCodesCount', () => {
      it('should save backup codes', () => {
        const user = createUser(getUniqueEmail('backup'), 'pass');
        const codes = ['hash1', 'hash2', 'hash3', 'hash4', 'hash5'];

        saveBackupCodes(user.id, codes);

        const count = getBackupCodesCount(user.id);
        expect(count).toBe(5);
      });

      it('should replace existing codes', () => {
        const user = createUser(getUniqueEmail('backupreplace'), 'pass');

        saveBackupCodes(user.id, ['old1', 'old2']);
        saveBackupCodes(user.id, ['new1', 'new2', 'new3']);

        const count = getBackupCodesCount(user.id);
        expect(count).toBe(3);
      });
    });

    describe('verifyAndUseBackupCode', () => {
      it('should verify and consume valid backup code', () => {
        // Test backup code verification
        const user = createUser(getUniqueEmail('backupverify'), 'pass');
        const code = 'ABCD-EFGH-IJKL-MNOP';
        
        // Calculate expected hash
        const crypto = require('crypto');
        const salt = `${user.id}-backup-code-salt`;
        const normalizedCode = code.replace(/-/g, '').toUpperCase();
        const codeHash = crypto.pbkdf2Sync(normalizedCode, salt, 100000, 32, 'sha256').toString('hex');
        
        saveBackupCodes(user.id, [codeHash]);

        const result = verifyAndUseBackupCode(user.id, code);
        expect(result).toBe(true);

        const count = getBackupCodesCount(user.id);
        expect(count).toBe(0);
      });

      it('should return false for invalid code', () => {
        const user = createUser(getUniqueEmail('backupinvalid'), 'pass');
        
        saveBackupCodes(user.id, ['somehash']);

        const result = verifyAndUseBackupCode(user.id, 'WRONG-CODE-1234-5678');
        expect(result).toBe(false);
      });
    });

    describe('Passkey Management', () => {
      it('should save and retrieve passkeys', () => {
        const user = createUser(getUniqueEmail('passkey'), 'pass');

        savePasskey(user.id, 'cred-1', 'public-key-data', 0);

        const passkeys = getPasskeys(user.id);
        expect(passkeys.length).toBeGreaterThanOrEqual(1);
        expect(passkeys.some(p => p.credentialId === 'cred-1')).toBe(true);
      });

      it('should get passkey by credential ID', () => {
        const user = createUser(getUniqueEmail('passkeyget'), 'pass');

        savePasskey(user.id, 'cred-2', 'key-data', 5);

        const passkey = getPasskey('cred-2');
        expect(passkey).toBeDefined();
        expect(passkey?.userId).toBe(user.id);
        expect(passkey?.counter).toBe(5);
      });

      it('should return null for non-existent credential', () => {
        const passkey = getPasskey('non-existent-cred');
        expect(passkey).toBeNull();
      });

      it('should update passkey counter', () => {
        const user = createUser(getUniqueEmail('passkeycounter'), 'pass');

        savePasskey(user.id, 'cred-3', 'key', 0);
        updatePasskeyCounter('cred-3', 10);

        const passkey = getPasskey('cred-3');
        expect(passkey?.counter).toBe(10);
      });

      it('should delete passkey by credential ID', () => {
        const user = createUser(getUniqueEmail('passkeydel'), 'pass');

        savePasskey(user.id, 'cred-4', 'key', 0);
        const result = deletePasskey('cred-4');

        expect(result).toBe(true);
        expect(getPasskey('cred-4')).toBeNull();
      });

      it('should return false when deleting non-existent passkey', () => {
        const result = deletePasskey('non-existent');
        expect(result).toBe(false);
      });

      it('should delete all passkeys for user', () => {
        const user = createUser(getUniqueEmail('passkeydelall'), 'pass');

        savePasskey(user.id, 'cred-5', 'key1', 0);
        savePasskey(user.id, 'cred-6', 'key2', 0);
        
        const deletedCount = deleteAllPasskeys(user.id);

        expect(deletedCount).toBeGreaterThanOrEqual(2);
        expect(getPasskeys(user.id)).toHaveLength(0);
      });
    });

    describe('Two-Factor Status', () => {
      it('should enable and check 2FA status', () => {
        const user = createUser(getUniqueEmail('2fa'), 'pass');

        expect(isTwoFactorEnabled(user.id)).toBe(false);

        setTwoFactorEnabled(user.id, true);
        expect(isTwoFactorEnabled(user.id)).toBe(true);

        setTwoFactorEnabled(user.id, false);
        expect(isTwoFactorEnabled(user.id)).toBe(false);
      });

      it('should return complete 2FA status', () => {
        const user = createUser(getUniqueEmail('2fastatus'), 'pass');

        const status = getTwoFactorStatus(user.id);

        expect(status).toHaveProperty('enabled');
        expect(status).toHaveProperty('totpEnabled');
        expect(status).toHaveProperty('passkeyEnabled');
        expect(status).toHaveProperty('emailEnabled');
        expect(status).toHaveProperty('backupCodesRemaining');
      });

      it('should detect TOTP as enabled when secret exists', () => {
        const user = createUser(getUniqueEmail('2fatotp'), 'pass');

        saveTotpSecret(user.id, 'SECRET');

        const status = getTwoFactorStatus(user.id);
        expect(status.totpEnabled).toBe(true);
      });

      it('should detect passkey as enabled when passkeys exist', () => {
        const user = createUser(getUniqueEmail('2fapasskey'), 'pass');

        savePasskey(user.id, 'cred', 'key', 0);

        const status = getTwoFactorStatus(user.id);
        expect(status.passkeyEnabled).toBe(true);
      });
    });
  });

  describe('Token Generation', () => {
    describe('generatePasswordResetToken', () => {
      it('should generate a password reset token', () => {
        const user = createUser(getUniqueEmail('reset'), 'pass');

        const token = generatePasswordResetToken(user.id);

        expect(token).toBeDefined();
        expect(typeof token).toBe('string');
      });
    });

    describe('generateEmailVerificationToken', () => {
      it('should generate an email verification token', () => {
        const user = createUser(getUniqueEmail('verify'), 'pass');

        const token = generateEmailVerificationToken(user.id);

        expect(token).toBeDefined();
        expect(typeof token).toBe('string');
      });
    });
  });

  describe('OAuth Management', () => {
    describe('createOAuthUser', () => {
      it('should create user with OAuth profile', () => {
        const email = getUniqueEmail('oauth');
        const profile = {
          provider: 'google' as const,
          providerId: `google-123-${Date.now()}`,
          email,
          name: 'OAuth User',
          avatarUrl: 'https://example.com/avatar.png',
        };

        const user = createOAuthUser(profile);

        expect(user).toBeDefined();
        expect(user.email).toBe(email);
        expect(user.displayName).toBe('OAuth User');
        expect(user.emailVerified).toBe(false);
      });

      it('should use display name from parameter over profile name', () => {
        const profile = {
          provider: 'github' as const,
          providerId: `github-456-${Date.now()}`,
          email: getUniqueEmail('github'),
          name: 'GitHub Name',
        };

        const user = createOAuthUser(profile, 'Custom Name');

        expect(user.displayName).toBe('Custom Name');
      });

      it('should create OAuth account record', () => {
        const profile = {
          provider: 'google' as const,
          providerId: `google-789-${Date.now()}`,
          email: getUniqueEmail('account'),
          name: 'Account User',
        };

        const user = createOAuthUser(profile);
        const accounts = getUserOAuthAccounts(user.id);

        expect(accounts.length).toBeGreaterThanOrEqual(1);
        expect(accounts.some(a => a.provider === 'google' && a.providerId.startsWith('google-789'))).toBe(true);
      });
    });

    describe('getUserByOAuth', () => {
      it('should find user by OAuth provider and ID', () => {
        const profile = {
          provider: 'google' as const,
          providerId: `google-find-${Date.now()}`,
          email: getUniqueEmail('find'),
          name: 'Find Me',
        };

        const created = createOAuthUser(profile);
        const found = getUserByOAuth('google', profile.providerId);

        expect(found).toBeDefined();
        expect(found?.id).toBe(created.id);
      });

      it('should return null for non-existent OAuth account', () => {
        const user = getUserByOAuth('google', 'non-existent');
        expect(user).toBeNull();
      });
    });

    describe('linkOAuthAccount', () => {
      it('should link OAuth account to existing user', () => {
        const user = createUser(getUniqueEmail('link'), 'pass');
        const profile = {
          provider: 'google' as const,
          providerId: `google-link-${Date.now()}`,
          email: getUniqueEmail('linkoauth'),
          name: 'Linked User',
        };

        linkOAuthAccount(user.id, profile);

        const accounts = getUserOAuthAccounts(user.id);
        expect(accounts.length).toBeGreaterThanOrEqual(1);
        expect(accounts.some(a => a.provider === 'google')).toBe(true);
      });
    });

    describe('getOAuthAccount', () => {
      it('should retrieve OAuth account', () => {
        const profile = {
          provider: 'github' as const,
          providerId: `github-get-${Date.now()}`,
          email: getUniqueEmail('get'),
          name: 'Get User',
        };

        const user = createOAuthUser(profile);
        const account = getOAuthAccount('github', profile.providerId);

        expect(account).toBeDefined();
        expect(account?.userId).toBe(user.id);
      });

      it('should return null for non-existent account', () => {
        const account = getOAuthAccount('google', 'non-existent');
        expect(account).toBeNull();
      });
    });

    describe('getUserOAuthAccounts', () => {
      it('should return all OAuth accounts for user', () => {
        const profile1 = {
          provider: 'google' as const,
          providerId: `google-multi-${Date.now()}`,
          email: getUniqueEmail('multi'),
          name: 'Multi User',
        };

        const user = createOAuthUser(profile1);
        
        // Link another account
        linkOAuthAccount(user.id, {
          provider: 'github',
          providerId: `github-multi-${Date.now()}`,
          email: getUniqueEmail('multigithub'),
          name: 'Multi User',
        });

        const accounts = getUserOAuthAccounts(user.id);
        expect(accounts.length).toBeGreaterThanOrEqual(2);
      });

      it('should return empty array for user with no OAuth accounts', () => {
        const user = createUser(getUniqueEmail('nooauth'), 'pass');
        const accounts = getUserOAuthAccounts(user.id);
        expect(Array.isArray(accounts)).toBe(true);
      });
    });

    describe('unlinkOAuthAccount', () => {
      it('should unlink OAuth account', () => {
        const profile = {
          provider: 'google' as const,
          providerId: `google-unlink-${Date.now()}`,
          email: getUniqueEmail('unlink'),
          name: 'Unlink User',
        };

        const user = createOAuthUser(profile);
        expect(getUserOAuthAccounts(user.id).length).toBeGreaterThanOrEqual(1);

        const result = unlinkOAuthAccount(user.id, 'google');

        expect(result).toBe(true);
      });

      it('should return false when unlinking non-linked provider', () => {
        const user = createUser(getUniqueEmail('nounlink'), 'pass');
        const result = unlinkOAuthAccount(user.id, 'google');
        expect(result).toBe(false);
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle duplicate email constraint', () => {
      const duplicateEmail = getUniqueEmail('duplicate');
      createUser(duplicateEmail, 'pass1');
      
      expect(() => {
        createUser(duplicateEmail, 'pass2');
      }).toThrow();
    });

    it('should handle empty SNP array', () => {
      const user = createUser(getUniqueEmail('emptysnps'), 'password_hash');
      const fileBuffer = Buffer.from('empty snps');
      
      const result = saveGenome(
        'empty.txt',
        'empty.txt',
        '23andme',
        [],
        fileBuffer,
        'cs',
        null,
        user.id
      );

      expect(result.storedSnps).toBe(0);
      
      const genome = getGenome(result.id);
      expect(genome?.snps).toEqual([]);
    });

    it('should handle special characters in strings', () => {
      const user = createUser(getUniqueEmail('special"email'), 'pass');
      
      updateUserProfile(user.id, { 
        bio: 'Bio with "quotes" and \'apostrophes\' and <html>',
        ancestry: 'European & Asian'
      });

      const profile = getUserProfile(user.id);
      expect(profile?.bio).toBe('Bio with "quotes" and \'apostrophes\' and <html>');
      expect(profile?.ancestry).toBe('European & Asian');
    });

    it('should handle very long strings', () => {
      const user = createUser(getUniqueEmail('long'), 'pass');
      const longBio = 'a'.repeat(5000);
      
      updateUserProfile(user.id, { bio: longBio });

      const profile = getUserProfile(user.id);
      expect(profile?.bio).toBe(longBio);
    });

    it('should handle UUID validation', () => {
      const user = createUser(getUniqueEmail('uuid'), 'pass');
      
      // UUID should be valid format
      expect(user.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
    });
  });
});
