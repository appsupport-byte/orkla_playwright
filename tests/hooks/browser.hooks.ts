import { Before, After, BeforeAll, setDefaultTimeout, Status } from '@cucumber/cucumber';
import * as fs from 'fs';
import * as path from 'path';
import { OrklaWorld } from '../support/world';
import { ENV } from '../config/env.config';
import { Logger } from '../utils/logger.util';
import { RuntimeDataStore } from '../utils/runtime-data.util';

// ─── Global timeout (matches DEFAULT_TIMEOUT_MS in .env) ─────────────────────
setDefaultTimeout(ENV.DEFAULT_TIMEOUT_MS);

// ─── Create output directories once before any scenario runs ─────────────────
// FIX 3: was only creating reports/ — reports/videos/ was never made,
//         so video.saveAs() threw "directory does not exist"
BeforeAll(async function () {
  fs.mkdirSync('reports/videos', { recursive: true });
  Logger.info('Ensured reports/ and reports/videos/ directories exist');
  RuntimeDataStore.clear();
});

// ─── Before each scenario: launch browser & open page ────────────────────────
Before(async function (this: OrklaWorld, scenario) {
  Logger.info(`━━━ Starting scenario: "${scenario.pickle.name}" ━━━`);
  await this.openBrowser();
});

// ─── After each scenario: video → screenshot → close ─────────────────────────
After(async function (this: OrklaWorld, scenario) {
  const status = scenario.result?.status ?? 'unknown';
  const safeName = scenario.pickle.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();

  // ── Screenshot on failure ──────────────────────────────────────────────────
  if (status === Status.FAILED) {
    Logger.error(`Scenario FAILED: "${scenario.pickle.name}"`);
    try {
      const screenshot = await this.page.screenshot({ fullPage: true });
      await this.attach(screenshot, 'image/png');
      fs.writeFileSync(`reports/${safeName}_failure.png`, screenshot);
    } catch {
      Logger.warn('Could not capture failure screenshot');
    }
  } else {
    Logger.success(`Scenario PASSED: "${scenario.pickle.name}"`);
  }

  // ── Video save ────────────────────────────────────────────────────────────
  // FIX 4: original code called this.closeBrowser() (which closes context)
  //         AFTER page.close() — Playwright threw because context was already
  //         being torn down. Correct order:
  //         1. page.close()   → finalises the .webm temp file
  //         2. video.saveAs() → copies to named file
  //         3. context.close() + browser.close() via closeBrowser()
  if (ENV.VIDEO) {
    const video = this.page.video();
    if (video) {
      // Step 1 — close page so Playwright flushes/finalises the video file
      await this.page.close();

      // Step 2 — save to a human-readable name
      const destPath = path.join(ENV.VIDEO_DIR, `${safeName}.webm`);
      await video.saveAs(destPath);
      await video.delete(); // delete the random temp file
      Logger.success(`Video saved → ${destPath}`);

      // Attach to Cucumber HTML report so it's viewable inline
      const videoBuffer = fs.readFileSync(destPath);
      await this.attach(videoBuffer, 'video/webm');
    }
  }

  Logger.info('━━━ Scenario teardown complete ━━━\n');

  // Step 3 — close context & browser (page is already closed above)
  await this.closeBrowser();
  RuntimeDataStore.logSummary();
});
