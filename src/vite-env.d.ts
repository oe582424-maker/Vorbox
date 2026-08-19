/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_WHATSAPP_NUMBER?: string;
  readonly APP_URL?: string;
  readonly [key: string]: any;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
