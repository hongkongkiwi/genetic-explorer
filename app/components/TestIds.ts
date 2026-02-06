/**
 * Test ID Constants
 * 
 * Centralized test IDs for E2E testing.
 * Use these constants to ensure consistency across tests and components.
 */

export const TestIds = {
  // Navigation
  navbar: 'navbar',
  navLogo: 'nav-logo',
  navDashboard: 'nav-dashboard',
  navUpload: 'nav-upload',
  navGenomes: 'nav-genomes',
  navReports: 'nav-reports',
  navSettings: 'nav-settings',
  navLogin: 'nav-login',
  navLogout: 'nav-logout',
  navUserMenu: 'nav-user-menu',
  navSearchButton: 'nav-search-button',
  mobileMenuButton: 'mobile-menu-button',

  // Auth
  loginForm: 'login-form',
  loginEmail: 'login-email',
  loginPassword: 'login-password',
  loginSubmit: 'login-submit',
  loginError: 'login-error',
  registerForm: 'register-form',
  registerEmail: 'register-email',
  registerPassword: 'register-password',
  registerSubmit: 'register-submit',

  // Dashboard
  dashboard: 'dashboard',
  dashboardStats: 'dashboard-stats',
  dashboardGenomes: 'dashboard-genomes',
  dashboardReports: 'dashboard-reports',
  dashboardUploadButton: 'dashboard-upload-button',

  // Upload
  uploadZone: 'upload-zone',
  uploadInput: 'upload-input',
  uploadDropzone: 'upload-dropzone',
  uploadProgress: 'upload-progress',
  uploadError: 'upload-error',
  uploadSuccess: 'upload-success',

  // Genome
  genomeList: 'genome-list',
  genomeItem: 'genome-item',
  genomeDelete: 'genome-delete',
  genomeView: 'genome-view',
  genomeName: 'genome-name',

  // Reports
  reportList: 'report-list',
  reportItem: 'report-item',
  reportView: 'report-view',
  reportDownload: 'report-download',

  // SNP Explorer
  explorerSearch: 'explorer-search',
  explorerFilter: 'explorer-filter',
  explorerTable: 'explorer-table',
  explorerRow: 'explorer-row',

  // Settings
  settingsForm: 'settings-form',
  settingsSave: 'settings-save',
  settingsEmail: 'settings-email',
  settingsPassword: 'settings-password',
  settings2fa: 'settings-2fa',
  settingsDeleteAccount: 'settings-delete-account',

  // Common UI
  button: 'button',
  buttonLoading: 'button-loading',
  modal: 'modal',
  modalClose: 'modal-close',
  modalConfirm: 'modal-confirm',
  modalCancel: 'modal-cancel',
  toast: 'toast',
  toastSuccess: 'toast-success',
  toastError: 'toast-error',
  loadingSpinner: 'loading-spinner',
  errorMessage: 'error-message',
  emptyState: 'empty-state',

  // Forms
  formField: 'form-field',
  formLabel: 'form-label',
  formInput: 'form-input',
  formError: 'form-error',
  formSubmit: 'form-submit',

  // Sharing
  shareButton: 'share-button',
  shareModal: 'share-modal',
  shareEmail: 'share-email',
  sharePermission: 'share-permission',
  shareSubmit: 'share-submit',

  // Footer
  footer: 'footer',
  footerPrivacy: 'footer-privacy',
  footerTerms: 'footer-terms',
  footerContact: 'footer-contact',
} as const;

export type TestId = typeof TestIds[keyof typeof TestIds];
