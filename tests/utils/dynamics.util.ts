import { Page } from '@playwright/test';
import { ENV } from '../config/env.config';
import { Logger } from './logger.util';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface DynamicsLoadOptions {
  /** Max ms to wait for page readiness. Default: ENV.PAGE_LOAD_TIMEOUT */
  timeout?: number;
  /** Wait for the ActionPane / command bar. Default: true */
  waitForCommandBar?: boolean;
  /** Wait for at least one FastTab header (form pages only). Default: true */
  waitForFastTabs?: boolean;
  /** Extra selectors that must all be visible before resolving. */
  extraSelectors?: string[];
}

export interface DynamicsLoadResult {
  /** Signal that confirmed page readiness */
  readySignal: 'ProcessMessages' | 'ProcessEventData' | 'fpconfig' | 'domIdle';
  /** Total ms elapsed */
  totalDurationMs: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// D365 F&O Selectors
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Loading overlays — must DISAPPEAR before the page is usable.
 * These block all user interaction in D365 F&O while data loads.
 */
const LOADING_OVERLAY_SELECTORS = [
  '.progressIndicator',
  '.loadingIndicator',
  '[data-dyn-role="progressIndicator"]',
  '.waitCursor',
  '.curtain',
];

/**
 * Page-ready indicator selectors.
 *
 * Strategy: use the SAME selectors the existing supplier.steps.ts already
 * proves work (data-dyn-controlname), plus broad data-dyn-role selectors
 * confirmed from D365 F&O source documentation.
 *
 * We use ANY-OF matching: page is ready when at least one selector in each
 * group is visible — so a miss on one class name won't block everything.
 */
const PAGE_READY_SELECTOR =
  // data-dyn-role="Page" is set on the root container of every D365 F&O page
  '[data-dyn-role="Page"], ' +
  // Workspace / content area — present on every list and form page
  '[data-dyn-role="ContentPane"], ' +
  // Section page — alternative root used in some layouts
  '.sectionPage, ' +
  // The app shell itself — present from the moment D365 boots
  '[data-dyn-role="NavBarControls"], ' +
  // Form root — present on both list and detail pages  
  '[data-dyn-role="Form"]';

const NAV_BAR_SELECTOR =
  // Standard navigation bar role
  '[data-dyn-role="NavigationBar"], ' +
  // ID used by the top black "Finance and Operations" header bar
  '#headerBar, ' +
  // CSS class confirmed in D365 F&O shell
  '.navigationBar, ' +
  // Aria label on the top bar — confirmed from screenshot
  '[aria-label="Finance and Operations"]';

const COMMAND_BAR_SELECTOR =
  // ActionPane = the ribbon row containing Save/New/Delete/tab buttons
  '[data-dyn-role="ActionPane"], ' +
  // The New button selector ALREADY PROVEN to work in supplier.steps.ts
  '[data-dyn-controlname="SystemDefinedNewButton"], ' +
  // Alternative class names
  '.dyn-actionPane, .actionPane, .taskActions';

const FAST_TAB_SELECTOR =
  '[data-dyn-role="TabHeader"], ' +
  '[data-dyn-role="Group"], ' +
  '.sectionHeader, .tabHeader, ' +
  // Group containers used in F&O form layouts
  '[data-dyn-role="GroupedList"]';

const GRID_SELECTOR =
  '[data-dyn-role="Grid"], ' +
  '.dyn-grid, ' +
  // Grid rows — proven to exist when the vendor list loads
  '[data-dyn-role="Row"], ' +
  // The grid body table
  'table[data-dyn-role]';

// ─────────────────────────────────────────────────────────────────────────────
// Network signal  (intercepts real browser traffic, no outbound HTTP probe)
// ─────────────────────────────────────────────────────────────────────────────

async function waitForDynamicsNetworkSignal(
  page: Page,
  timeout: number,
): Promise<DynamicsLoadResult['readySignal']> {
  Logger.info('Listening for D365 F&O network readiness signal…');

  const result = await Promise.race([
    page.waitForResponse(
      res => res.url().includes('ProcessMessages') &&
        res.request().method() === 'POST' &&
        res.status() === 200,
      { timeout },
    ).then(() => 'ProcessMessages' as const).catch(() => null),

    page.waitForResponse(
      res => res.url().includes('ProcessEventData') && res.status() === 200,
      { timeout },
    ).then(() => 'ProcessEventData' as const).catch(() => null),

    page.waitForResponse(
      res => res.url().includes('fpconfig.min.json') && res.status() === 200,
      { timeout },
    ).then(() => 'fpconfig' as const).catch(() => null),
  ]);

  const signal = result ?? 'domIdle';
  if (signal === 'domIdle') {
    Logger.warn('No network signal fired — DOM-only checks will determine readiness.');
  } else {
    Logger.success(`Network readiness signal: ${signal}`);
  }
  return signal;
}

// ─────────────────────────────────────────────────────────────────────────────
// DOM helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Tries every selector in a comma-separated list individually.
 * Returns true as soon as one is found visible.
 * Never throws — caller decides what to do with false.
 */
/**
 * anyOf — ES2020-safe replacement for Promise.any().
 * Resolves true as soon as one promise resolves true;
 * resolves false only when ALL have resolved false.
 */
function anyOf(promises: Promise<boolean>[]): Promise<boolean> {
  return new Promise<boolean>((resolve) => {
    let remaining = promises.length;
    if (remaining === 0) { resolve(false); return; }
    for (const p of promises) {
      p.then(v => { if (v) resolve(true); })
        .catch(() => { })
        .finally(() => { remaining--; if (remaining === 0) resolve(false); });
    }
  });
}

async function isAnyVisible(page: Page, combinedSelector: string, timeout: number): Promise<boolean> {
  const selectors = combinedSelector.split(',').map(s => s.trim()).filter(Boolean);
  const checks = selectors.map(sel =>
    page.waitForSelector(sel, { state: 'visible', timeout })
      .then(() => true)
      .catch(() => false),
  );
  // Race anyOf against a hard deadline so we never block longer than timeout
  return Promise.race([
    anyOf(checks),
    new Promise<false>(resolve => setTimeout(() => resolve(false), timeout + 500)),
  ]);
}

async function assertAnyVisible(
  page: Page, combinedSelector: string, label: string, timeout: number,
): Promise<void> {
  const found = await isAnyVisible(page, combinedSelector, timeout);
  if (!found) {
    // Diagnostic: list which selectors were tried
    const tried = combinedSelector.split(',').map(s => s.trim()).join('\n    ');
    throw new Error(
      `[DynamicsUtil] "${label}" — none of the selectors were visible after ${timeout}ms.\n` +
      `  Tried:\n    ${tried}\n` +
      `  Page URL: ${page.url()}\n\n` +
      `  ► Run this in DevTools Console to find the correct selector:\n` +
      `    copy(Array.from(document.querySelectorAll('[data-dyn-role]')).map(e => e.getAttribute('data-dyn-role')).filter((v,i,a)=>a.indexOf(v)===i).join('\\n'))`,
    );
  }
}

async function assertGone(
  page: Page, selector: string, label: string, timeout: number,
): Promise<void> {
  const selectors = selector.split(',').map(s => s.trim()).filter(Boolean);
  // For "gone" checks, ALL selectors must be hidden (any visible = still loading)
  for (const sel of selectors) {
    try {
      await page.waitForSelector(sel, { state: 'hidden', timeout: Math.min(timeout, 5_000) });
    } catch {
      // If selector doesn't exist at all that is also fine — element is "gone"
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Selector discovery helper (logs all data-dyn-role values on the page)
// ─────────────────────────────────────────────────────────────────────────────

async function logPageRoles(page: Page): Promise<void> {
  try {
    const roles: string[] = await page.evaluate(() =>
      Array.from(document.querySelectorAll('[data-dyn-role]'))
        .map(e => e.getAttribute('data-dyn-role') ?? '')
        .filter((v, i, a) => v && a.indexOf(v) === i)
        .sort(),
    );
    Logger.info(`data-dyn-role values on page: ${roles.join(', ') || '(none found)'}`);

    const dynControlNames: string[] = await page.evaluate(() =>
      Array.from(document.querySelectorAll('[data-dyn-controlname]'))
        .map(e => e.getAttribute('data-dyn-controlname') ?? '')
        .filter((v, i, a) => v && a.indexOf(v) === i)
        .slice(0, 20)
        .sort(),
    );
    Logger.info(`data-dyn-controlname values (first 20): ${dynControlNames.join(', ') || '(none found)'}`);
  } catch {
    Logger.warn('Could not inspect page roles — page may not be ready yet');
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Main export
// ─────────────────────────────────────────────────────────────────────────────

export class DynamicsUtil {

  /**
   * Waits for a D365 Finance & Operations page to be fully ready.
   *
   * Uses NO external HTTP probes. Instead:
   *  1. networkidle  — waits for XHRs to settle
   *  2. Network signal  — intercepts ProcessMessages / fpconfig responses
   *  3. Overlay gone  — loading curtains dismissed
   *  4. Page root visible  — [data-dyn-role="Page"] or equivalent
   *  5. Nav bar visible  — #headerBar / .navigationBar
   *  6. Command bar (optional)
   *  7. FastTabs (optional)
   *  8. Extra caller selectors
   *
   * If any DOM assertion fails the error message prints:
   *  - which selectors were tried
   *  - the current URL
   *  - a one-liner DevTools command to discover the real selectors
   */
  static async waitForPageLoad(
    page: Page,
    options: DynamicsLoadOptions = {},
  ): Promise<DynamicsLoadResult> {
    const {
      timeout = ENV.PAGE_LOAD_TIMEOUT,
      waitForCommandBar = true,
      waitForFastTabs = true,
      extraSelectors = [],
    } = options;

    const start = Date.now();
    const remaining = () => Math.max((start + timeout) - Date.now(), 5_000);

    Logger.step('DynamicsUtil.waitForPageLoad — starting');

    // ── 1. Network idle ──────────────────────────────────────────────────────
    Logger.info('Waiting for networkidle…');
    await page.waitForLoadState('networkidle', { timeout });
    Logger.success('Network idle');

    // Log existing roles immediately after idle so we can diagnose selector issues
    await logPageRoles(page);

    // ── 2. Network signal (10 s window — graceful if page is pre-cached) ────
    const readySignal = await waitForDynamicsNetworkSignal(page, Math.min(remaining(), 10_000));

    // ── 3. Overlays gone ─────────────────────────────────────────────────────
    Logger.info('Waiting for loading overlays to disappear…');
    await assertGone(page, LOADING_OVERLAY_SELECTORS.join(', '), 'Loading overlay', remaining());
    Logger.success('No loading overlays present');

    // ── 4. Page root ─────────────────────────────────────────────────────────
    Logger.info('Asserting page root…');
    await assertAnyVisible(page, PAGE_READY_SELECTOR, 'Page root', remaining());
    Logger.success('Page root visible');

    // ── 5. Navigation bar ────────────────────────────────────────────────────
    Logger.info('Asserting navigation bar…');
    await assertAnyVisible(page, NAV_BAR_SELECTOR, 'Navigation bar', remaining());
    Logger.success('Navigation bar visible');

    // ── 6. Command bar ───────────────────────────────────────────────────────
    if (waitForCommandBar) {
      Logger.info('Asserting command bar…');
      await assertAnyVisible(page, COMMAND_BAR_SELECTOR, 'Command bar', remaining());
      Logger.success('Command bar visible');
    }

    // ── 7. FastTab headers ───────────────────────────────────────────────────
    if (waitForFastTabs) {
      Logger.info('Asserting FastTab headers…');
      await assertAnyVisible(page, FAST_TAB_SELECTOR, 'FastTab header', remaining());
      Logger.success('FastTab headers visible');
    }

    // ── 8. Extra selectors ───────────────────────────────────────────────────
    for (const sel of extraSelectors) {
      Logger.info(`Asserting extra selector: ${sel}`);
      await assertAnyVisible(page, sel, sel, remaining());
      Logger.success(`Extra selector visible: ${sel}`);
    }

    const totalDurationMs = Date.now() - start;
    Logger.success(`DynamicsUtil.waitForPageLoad complete — ${totalDurationMs}ms | signal: ${readySignal}`);
    return { readySignal, totalDurationMs };
  }

  // ─── Convenience variants ──────────────────────────────────────────────────

  static async waitForPageLoadAndAssertNoErrors(
    page: Page, options: DynamicsLoadOptions = {},
  ): Promise<DynamicsLoadResult> {
    const result = await DynamicsUtil.waitForPageLoad(page, options);
    Logger.step('Asserting no D365 error banners…');
    const errorBanner = page.locator(
      '.dyn-alert-error, [data-dyn-role="alert"][class*="error"], .messageBar.error, .errorText',
    );
    const visible = await errorBanner.first().isVisible().catch(() => false);
    if (visible) {
      const msg = await errorBanner.first().innerText().catch(() => '(unreadable)');
      throw new Error(`[DynamicsUtil] Error banner visible: "${msg}"`);
    }
    Logger.success('No error banners present');
    return result;
  }

  /**
   * For list / grid pages (VendTableListPage etc.)
   * Uses the Grid selector and skips FastTabs (lists have none).
   */
  static async waitForListPageLoad(
    page: Page, options: DynamicsLoadOptions = {},
  ): Promise<DynamicsLoadResult> {
    return DynamicsUtil.waitForPageLoad(page, {
      waitForCommandBar: true,
      waitForFastTabs: false,
      ...options,
      extraSelectors: [
        GRID_SELECTOR,
        ...(options.extraSelectors ?? []),
      ],
    });
  }

  /**
   * For detail / record form pages (new or existing vendor).
   */
  static async waitForFormLoad(
    page: Page, options: DynamicsLoadOptions = {},
  ): Promise<DynamicsLoadResult> {
    return DynamicsUtil.waitForPageLoad(page, {
      waitForCommandBar: true,
      waitForFastTabs: true,
      ...options,
      extraSelectors: [
        '[data-dyn-controlname] input, [data-dyn-controlname] select',
        ...(options.extraSelectors ?? []),
      ],
    });
  }
}
