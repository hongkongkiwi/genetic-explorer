/// <reference types="vinxi/types/client" />

interface ImportMetaEnv {
  readonly VITE_ENABLE_GOOGLE_OAUTH: string;
  readonly VITE_ENABLE_GITHUB_OAUTH: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
