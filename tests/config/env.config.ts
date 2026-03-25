import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const getRequiredEnvVar = (key: string): string => {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required environment variable: ${key}`);
  return value;
};

const getOptionalEnvVar = (key: string, fallback: string): string => {
  return process.env[key] ?? fallback;
};

export const ENV = {
  LOGIN_URL: getRequiredEnvVar('LOGIN_URL'),
  TEST_USERNAME: getRequiredEnvVar('TEST_USERNAME'),
  TEST_PASSWORD: getRequiredEnvVar('TEST_PASSWORD'),
  BASE_URL_DOMAIN: getRequiredEnvVar('BASE_URL_DOMAIN'),
  VIDEO: getOptionalEnvVar('VIDEO', 'false') === 'true',
  VIDEO_DIR: getOptionalEnvVar('VIDEO_DIR', 'reports/videos'),
  SUPPLIER_LIST_URL: getRequiredEnvVar('SUPPLIER_LIST_URL'),

  // Optional with sensible defaults
  HEADLESS: getOptionalEnvVar('HEADLESS', 'true') === 'true',
  DEFAULT_TIMEOUT_MS: parseInt(getOptionalEnvVar('DEFAULT_TIMEOUT_MS', '120000'), 10),
  PAGE_LOAD_TIMEOUT: parseInt(getOptionalEnvVar('PAGE_LOAD_TIMEOUT', '15000'), 10),
  ELEMENT_TIMEOUT_MS: parseInt(getOptionalEnvVar('ELEMENT_TIMEOUT_MS', '10000'), 10),
  MFA_WAIT_MS: parseInt(getOptionalEnvVar('MFA_WAIT_MS', '300000'), 10),
  AUTH_FILE_PATH: getOptionalEnvVar('AUTH_FILE_PATH', 'auth.json'),
} as const;