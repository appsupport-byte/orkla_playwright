import { Page, Locator } from '@playwright/test';
import { ENV } from '../config/env.config';
import { PageUtil } from '../utils/page.util';


export class LoginPage {

  private readonly page: Page;

  // ─── Selectors ────────────────────────────────────────────────────────────────

  private readonly SELECTORS = {
    SIGN_IN_HEADING: 'div:has-text("Sign in")',
    USERNAME_INPUT: ['input[type="email"]', 'input[name*="loginfmt"]', 'input[id*="i0116"]'],
    PASSWORD_INPUT: ['input[type="password"]'],
    NEXT_BUTTON: ['input[type="submit"]', 'button:has-text("Next")', '#idSIButton9'],
    SIGN_IN_BUTTON: ['input[type="submit"]', 'button:has-text("Sign in")', 'button:has-text("Sign In")', '#idSIButton9'],
    CALLING_MFA_OPTION: ['//div[contains(text(),"Call")]'],
    ALREADY_SIGNED_IN_USER_ID: ['//div[contains(text(),"ext_chitis@orkla.biz")]']

  } as const;

  constructor(page: Page) {
    this.page = page;
  }

  // ─── Locators ─────────────────────────────────────────────────────────────────

  get signInHeading(): Locator {
    return this.page.locator(this.SELECTORS.SIGN_IN_HEADING).first();
  }

  get usernameInput(): Locator {
    return PageUtil.getFirstMatchingLocator(this.page, [...this.SELECTORS.USERNAME_INPUT]);
  }

  get passwordInput(): Locator {
    return PageUtil.getFirstMatchingLocator(this.page, [...this.SELECTORS.PASSWORD_INPUT]);
  }

  get nextButton(): Locator {
    return PageUtil.getFirstMatchingLocator(this.page, [...this.SELECTORS.NEXT_BUTTON]);
  }

  get signInButton(): Locator {
    return PageUtil.getFirstMatchingLocator(this.page, [...this.SELECTORS.SIGN_IN_BUTTON]);
  }

  get callingOption(): Locator {
    return PageUtil.getFirstMatchingLocator(this.page, [...this.SELECTORS.CALLING_MFA_OPTION]);
  }

  get alreadySignedInUserId(): Locator {
    return PageUtil.getFirstMatchingLocator(this.page, [...this.SELECTORS.ALREADY_SIGNED_IN_USER_ID]);
  }

  // ─── Actions ──────────────────────────────────────────────────────────────────

  async goto(): Promise<void> {
    await PageUtil.navigateTo(this.page, ENV.SUPPLIER_LIST_URL);
  }

  async pressEnterKey(): Promise<void> {
    await PageUtil.PressKey(this.alreadySignedInUserId, 'Enter');
  }


  async waitForSignInFormVisible(): Promise<void> {
    await PageUtil.waitForElement(this.signInHeading, {
      state: 'visible',
      timeout: ENV.PAGE_LOAD_TIMEOUT,
    });
  }

  async enterUsername(username: string): Promise<void> {
    await PageUtil.fillInput(this.usernameInput, username, 'Username');
  }

  async clickNext(): Promise<void> {
    await PageUtil.clickElement(this.nextButton, 'Next button');
  }

  async waitForPasswordField(): Promise<void> {
    await PageUtil.assertElementVisible(this.passwordInput, ENV.ELEMENT_TIMEOUT_MS);
  }

  async enterPassword(password: string): Promise<void> {
    await PageUtil.fillInput(this.passwordInput, password, 'Password');
  }

  async clickSignIn(): Promise<void> {
    await PageUtil.clickElement(this.signInButton, 'Sign In button');
    //await PageUtil.PressKey(this.passwordInput, 'Enter');
  }

  async waitForMfaOrRedirect(): Promise<void> {
    await PageUtil.waitForDuration(ENV.MFA_WAIT_MS, 'MFA / conditional access redirect');
  }

  async waitForMfaApproval(): Promise<void> {
    await PageUtil.waitForDuration(ENV.MFA_WAIT_MS, 'MFA / conditional approval wait');
  }

  async clickCallingMfaOption(): Promise<void> {
    await PageUtil.clickElement(this.callingOption, 'Call me MFA option');
  }

  async waitForDashboardRedirect(): Promise<void> {
    await PageUtil.waitForUrlContaining(this.page, ENV.BASE_URL_DOMAIN);
  }

  async assertOnDashboard(): Promise<void> {
    await PageUtil.assertUrlContains(this.page, ENV.BASE_URL_DOMAIN);
  }
}
