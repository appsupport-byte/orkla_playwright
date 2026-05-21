/**
 * Cucumber configuration (replaces playwright.config.ts for test running)
 *
 * @cucumber/cucumber reads .feature files natively — no bddgen step,
 * no compilation, no .bdd-gen output directory required.
 *
 * Run: npx cucumber-js  (or: npm test)
 */

const common = {
  // Feature files — read directly by Cucumber at runtime
  paths: ['tests/features/**/*.feature'],

  // Step definitions + hooks + world — all loaded via ts-node
  require: [
    'tests/support/world.ts',          // must be first — sets the World constructor
    'tests/hooks/**/*.ts',
    'tests/stepDefinition/**/*.ts',
  ],

  //requireModule: ['ts-node/register'],
  requireModule: ['ts-node/register', 'tsconfig-paths/register'],

  // Output: progress in terminal + HTML + JSON for CI/reporting
  format: [
    'progress-bar',
    'html:reports/cucumber-report.html',
    'json:reports/cucumber-report.json',
  ],

  formatOptions: { snippetInterface: 'async-await' },

  // D365 is session-sensitive — keep parallel: 1
  parallel: 1,

  // Retry once on CI
  retry: process.env.CI ? 1 : 0,
};

module.exports = {
  default: common,
  ci: {
    ...common,
    retry: 1,
  },
};
