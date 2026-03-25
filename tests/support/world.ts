import { setWorldConstructor, World, IWorldOptions } from '@cucumber/cucumber';
import { Browser, BrowserContext, Page } from '@playwright/test';
import { BrowserUtil } from '../utils/browser.util';
import { SessionUtil } from '../utils/session.util';
import { ENV } from '../config/env.config';
import { Logger } from '../utils/logger.util';

/**
 * OrklaWorld — one instance per Cucumber scenario.
 *
 * Replaces Playwright fixture injection. Every step definition accesses
 * the live browser, context, and page via `this` (e.g. `this.page`).
 *
 * Also exposes a `store` map for passing values between steps within a
 * scenario (e.g. auto-generated supplier ID → later assertion step).
 */
export class OrklaWorld extends World {
  browser!: Browser;
  context!: BrowserContext;
  page!: Page;

  /** Share data between steps in the same scenario */
  store: Record<string, string> = {};

  constructor(options: IWorldOptions) {
    super(options);
  }

  // ─── Lifecycle ──────────────────────────────────────────────────────────────

  async openBrowser(): Promise<void> {
    this.browser = await BrowserUtil.launchBrowser();

    // Reuse saved auth session when it exists
    const storageState = SessionUtil.sessionFileExists(ENV.AUTH_FILE_PATH)
      ? ENV.AUTH_FILE_PATH
      : undefined;

    if (storageState) {
      Logger.info(`Reusing auth session: ${storageState}`);
    } else {
      Logger.warn('No auth session found — browser will start unauthenticated');
    }

    this.context = await this.browser.newContext({
      storageState,
      baseURL: `https://${ENV.BASE_URL_DOMAIN}`,
      recordVideo: ENV.VIDEO
        ? { dir: ENV.VIDEO_DIR, size: { width: 1280, height: 720 } }
        : undefined,
    });

    this.context.setDefaultTimeout(ENV.ELEMENT_TIMEOUT_MS);
    this.context.setDefaultNavigationTimeout(ENV.PAGE_LOAD_TIMEOUT);

    this.page = await BrowserUtil.createPage(this.context);
  }

  async closeBrowser(): Promise<void> {
    await BrowserUtil.closeContext(this.context);
    await BrowserUtil.closeBrowser(this.browser);
  }
}

setWorldConstructor(OrklaWorld);
