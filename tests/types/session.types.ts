import { Browser, BrowserContext, Page } from '@playwright/test';

// ─── Session ──────────────────────────────────────────────────────────────────

export interface StorageState {
  cookies: Cookie[];
  origins: Origin[];
}

export interface Cookie {
  name: string;
  value: string;
  domain: string;
  path: string;
  expires: number;
  httpOnly: boolean;
  secure: boolean;
  sameSite: 'Strict' | 'Lax' | 'None';
}

export interface Origin {
  origin: string;
  localStorage: LocalStorageItem[];
}

export interface LocalStorageItem {
  name: string;
  value: string;
}

// ─── Cucumber World ───────────────────────────────────────────────────────────

export interface CucumberWorld {
  browser: Browser;
  context: BrowserContext;
  page: Page;
}

// ─── Locator Strategies ───────────────────────────────────────────────────────

export type WaitState = 'visible' | 'hidden' | 'attached' | 'detached';

export interface WaitOptions {
  timeout?: number;
  state?: WaitState;
}
