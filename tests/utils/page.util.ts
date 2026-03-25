import { Page, Locator, expect, Keyboard } from '@playwright/test';
import { ENV } from '../config/env.config';
import { Logger } from './logger.util';
import { WaitOptions } from '../types/session.types';

export class PageUtil {

  // ─── Navigation ──────────────────────────────────────────────────────────────

  static async navigateTo(page: Page, url: string): Promise<void> {
    Logger.step(`Navigating to: ${url}`);
    await page.goto(url, { waitUntil: 'networkidle' });
    //await page.pause(); // Brief pause to ensure page stability after load
  }

  static async waitForUrlContaining(page: Page, urlPattern: string): Promise<void> {
    Logger.step(`Waiting for URL matching: ${urlPattern}`);
    await page.waitForURL(`**/${urlPattern}/**`, { timeout: ENV.MFA_WAIT_MS });
  }

  // ─── Element Retrieval ───────────────────────────────────────────────────────

  static getFirstMatchingLocator(page: Page, selectors: string[]): Locator {
    return page.locator(selectors.join(', ')).first();
  }

  // ─── Element State ───────────────────────────────────────────────────────────

  static async waitForElement(locator: Locator, options?: WaitOptions): Promise<void> {
    await locator.waitFor({
      state: options?.state ?? 'visible',
      timeout: options?.timeout ?? ENV.PAGE_LOAD_TIMEOUT,
    });
  }

  static async isElementVisible(locator: Locator, timeout?: number): Promise<boolean> {
    try {
      await locator.waitFor({ state: 'visible', timeout: timeout ?? ENV.ELEMENT_TIMEOUT_MS });
      return true;
    } catch {
      return false;
    }
  }

  // ─── Input Actions ────────────────────────────────────────────────────────────

  static async fillOnlyInput(locator: Locator, value: string, label: string): Promise<void> {
    Logger.step(`Filling "${label}" with value`);
    await expect(locator).toBeVisible({ timeout: ENV.ELEMENT_TIMEOUT_MS });
    await locator.focus();
    await locator.click();
    await locator.fill(value);
    await locator.page().waitForTimeout(2000);
    Logger.success(`"${label}" field filled`);
  }

  static async waitForD365Loading(locator: Locator): Promise<void> {
    Logger.info('Waiting for D365 loading to complete...');
    try {
      // Wait a brief moment for D365 to show the overlay
      await locator.page().waitForTimeout(300);
      // Only wait for hidden if the overlay actually appeared
      const isVisible = await locator.isVisible().catch(() => false);
      if (isVisible) {
        await locator.waitFor({ state: 'hidden', timeout: ENV.PAGE_LOAD_TIMEOUT });
      }
      Logger.success('D365 loading completed');
    } catch {
      Logger.error('D365 loading did not complete within expected time');
    }
  }

  static async fillInput(locator: Locator, value: string, label: string): Promise<void> {
    Logger.step(`Filling "${label}" with value`);
    await expect(locator).toBeVisible({ timeout: ENV.ELEMENT_TIMEOUT_MS });

    const isReadonly = await locator.getAttribute('readonly');
    console.log(`Locator for "${label}" is readonly: ${isReadonly}`);
    await this.clickElement(locator, label);
    if (!isReadonly) {
      await locator.press('Control+A');
      await locator.press('Delete');
      await locator.pressSequentially(value, { delay: 50 });
      // await locator.press('Enter');
    }
    else {
      await locator.fill(value);
      await locator.page().waitForTimeout(2000);
    }
    //await expect(locator).toHaveValue(value);
    //Logger.success(`"${label}" field filled and verified`);
  }

  static async PressKey(locator: Locator, value: string): Promise<void> {
    await locator.press(value);
  }

  static async lookupSelectWithIconWithSelect(
    locator: Locator,
    subLocator: Locator,
    value: string,
    select: string
  ): Promise<void> {

    await locator.focus();
    await locator.click();
    await locator.press('Alt+ArrowDown');

    await locator.page().waitForTimeout(1000);

    if (select === "all") {
      //const selectAllCheckbox = locator.page.getByRole('checkbox', { name: 'Select or unselect all rows' });
      await subLocator.click();
      await locator.page().getByRole('button', { name: /select/i }).click();
    } else {
      //const inputField = this.page.locator(`input[value="${value}"]:visible`).first();
      await subLocator.waitFor({ state: 'visible' });
      await subLocator.scrollIntoViewIfNeeded();
      await subLocator.focus();
      await subLocator.press('Enter');
    }
  }


  static async fillAndPressKey(
    locator: Locator,
    value: string,
    key: string,
    fieldName = 'field'
  ): Promise<void> {
    await locator.waitFor({ state: 'visible' });
    await locator.click();
    await locator.press('Control+A');
    await locator.press('Delete');
    await locator.fill(value);
    await locator.page().waitForTimeout(2000);
    await locator.press(key);
    // Wait for D365 to process the key press before moving on
    await locator.page().waitForTimeout(500);
  }

  // ─── Click Actions ────────────────────────────────────────────────────────────

  static async clickElement(locator: Locator, label: string): Promise<void> {
    Logger.step(`Clicking "${label}"`);
    await expect(locator).toBeVisible({ timeout: ENV.ELEMENT_TIMEOUT_MS });
    await locator.click();
    await locator.page().waitForTimeout(2000);
    Logger.success(`"${label}" clicked`);
  }

  static async clickElementButtonName(locator: Locator, buttonName: string): Promise<void> {
    Logger.step(`Clicking button with name: "${buttonName}"`);
    await locator.focus();
    await expect(locator).toBeVisible({ timeout: ENV.ELEMENT_TIMEOUT_MS });
    await locator.click();
    await locator.page().waitForTimeout(2000);

    Logger.success(`Button "${buttonName}" clicked`);
  }

  /**
 * Expand a collapsible tab if its aria-expanded attribute is 'false'.
 */
  static async expandTabIfCollapsed(tab: Locator, fieldName = 'tab'): Promise<void> {
    const isCollapsed = (await tab.getAttribute('aria-expanded')) === 'false';
    if (isCollapsed) {
      await PageUtil.clickElement(tab, fieldName);
    }
  }

  /**
   * Right-click an element and select an option from the context menu.
   */
  static async rightClickAndSelectOption(
    locator: Locator,
    optionText: string,
    fieldName = 'field'
  ): Promise<void> {
    await locator.waitFor({ state: 'visible' });
    await locator.click({ button: 'right' });
    await locator.page().getByRole('menuitem', { name: optionText }).click();
  }

  // ─── Assertions ───────────────────────────────────────────────────────────────

  static async assertUrlContains(page: Page, expectedSubstring: string): Promise<void> {
    const currentUrl = page.url();
    Logger.step(`Asserting URL contains: ${expectedSubstring}`);
    expect(currentUrl).toContain(expectedSubstring);
    Logger.success(`URL verified: ${currentUrl}`);
  }

  static async assertElementVisible(locator: Locator, timeout?: number): Promise<void> {
    await expect(locator).toBeVisible({ timeout: timeout ?? ENV.ELEMENT_TIMEOUT_MS });
  }

  // ─── Wait Utilities ───────────────────────────────────────────────────────────

  static async waitForDuration(ms: number, reason: string): Promise<void> {
    Logger.info(`Waiting ${ms}ms — ${reason}`);
    await new Promise((resolve) => setTimeout(resolve, ms));
  }
}
