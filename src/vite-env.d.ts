/// <reference types="vite/client" />

interface ImportMetaEnv {
 readonly VITE_API_BASE_URL: string;

 readonly VITE_STORAGE_ACCESS_TOKEN_KEY: string;
 readonly VITE_STORAGE_REFRESH_TOKEN_KEY: string;
 readonly VITE_STORAGE_CURRENT_USER_KEY: string;

 readonly VITE_S3_STORAGE_BASE_URL: string;
}

interface ImportMeta {
 readonly env: ImportMetaEnv;
}
