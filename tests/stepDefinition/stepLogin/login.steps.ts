import { Given, When, Then } from '@cucumber/cucumber';
import { OrklaWorld } from '../../support/world';
import { ENV } from '../../config/env.config';
import { LoginPage } from '../../pages/loginpage';
import { SessionUtil } from '../../utils/session.util';
import { Logger } from '../../utils/logger.util';
import { Keyboard } from '@playwright/test';
import { PageUtil } from '@utils/page.util';

// ─── Helper: build a LoginPage from the World's live page ───────────────────
const lp = (world: OrklaWorld): LoginPage => new LoginPage(world.page);

// ─── GIVEN ───────────────────────────────────────────────────────────────────

Given<OrklaWorld>('I navigate to the Microsoft login page', async function () {
  await lp(this).goto();
});

Given<OrklaWorld>('the sign-in form is displayed', async function () {
  await lp(this).waitForSignInFormVisible();
});

// ─── WHEN ─────────────────────────────────────────────────────────────────────

When<OrklaWorld>('I enter a valid Orkla email address in the username field', async function () {
  Logger.info(`Using username: ${ENV.TEST_USERNAME}`);
  // await lp(this).enterUsername(ENV.TEST_USERNAME);
  await lp(this).pressEnterKey();
});

When<OrklaWorld>('I click the {string} button', async function (buttonLabel: string) {
  const label = buttonLabel.toLowerCase();
  if (label === 'next') {
    await lp(this).clickNext();
  } else if (label === 'sign in') {
    await lp(this).clickSignIn
  } else {
    throw new Error(`Unknown button label: "${buttonLabel}"`);
  }
});


When<OrklaWorld>('I enter a valid password', async function () {
  await lp(this).waitForPasswordField();
  await lp(this).enterPassword(ENV.TEST_PASSWORD);
});

When<OrklaWorld>('I complete MFA if prompted', async function () {

  await lp(this).clickCallingMfaOption();
  await lp(this).waitForMfaApproval();
});

// ─── THEN ─────────────────────────────────────────────────────────────────────

Then<OrklaWorld>('I should be redirected to the Orkla dashboard', async function () {
  await lp(this).waitForDashboardRedirect();
  await lp(this).assertOnDashboard();
});

Then<OrklaWorld>(
  'the authenticated session should be stored to {string}',
  async function (fileName: string) {
    const filePath = await SessionUtil.saveSession(this.context, fileName);
    Logger.success(`Session persisted to: ${filePath}`);
  }
);

Then<OrklaWorld>(
  'the {string} file should contain valid session cookies',
  async function (fileName: string) {
    const filePath = SessionUtil.resolvePath(fileName);
    SessionUtil.assertSessionFileExists(filePath);
    const session = SessionUtil.readSessionFile(filePath);
    SessionUtil.assertSessionHasCookies(session);
    SessionUtil.logSessionSummary(filePath, session);
  }
);
