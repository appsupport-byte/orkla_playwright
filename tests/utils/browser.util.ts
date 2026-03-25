import { chromium, Browser, BrowserContext, Page } from '@playwright/test';
import { ENV } from '../config/env.config';
import { Logger } from './logger.util';

export class BrowserUtil {
  // ─── Browser ────────────────────────────────────────────────────────────────

  static async launchBrowser(): Promise<Browser> {
    Logger.info(`Launching browser [headless=${ENV.HEADLESS}]`);
    return chromium.launch({ headless: ENV.HEADLESS });
  }

  static async closeBrowser(browser: Browser): Promise<void> {
    Logger.info('Closing browser');
    await browser.close();
  }

  // ─── Context ─────────────────────────────────────────────────────────────────

  static async createContext(browser: Browser): Promise<BrowserContext> {
    Logger.info('Creating new browser context');
    return browser.newContext();
  }

  static async closeContext(context: BrowserContext): Promise<void> {
    await context.close();
  }

  // ─── Page ─────────────────────────────────────────────────────────────────────

  static async createPage(context: BrowserContext): Promise<Page> {
    Logger.info('Creating new page');
    return context.newPage();
  }

  static async closePage(page: Page): Promise<void> {
    await page.close();
  }
}
