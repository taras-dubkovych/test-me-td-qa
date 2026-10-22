const fs = require('fs');
const path = require('path');
const { defineConfig } = require('cypress');

const AUTHORIZED_ORIGIN = 'https://test-me.vzl.one';

// Node's built-in loader never overrides variables already set in the shell.
for (const file of ['.env', '.env.example']) {
  const full = path.join(__dirname, file);
  if (fs.existsSync(full)) {
    process.loadEnvFile(full);
    break;
  }
}

const required = name => {
  const value = process.env[name];
  if (value === undefined || value === '') throw new Error(`Missing environment variable ${name}`);
  return value;
};
const number = name => {
  const value = Number(required(name));
  if (!Number.isFinite(value)) throw new Error(`Environment variable ${name} must be a number`);
  return value;
};

module.exports = defineConfig({
  e2e: {
    baseUrl: required('BASE_URL'),
    supportFile: false,
    testIsolation: true,
    setupNodeEvents(on, config) {
      if (config.baseUrl !== AUTHORIZED_ORIGIN) {
        throw new Error(`Only the published ${AUTHORIZED_ORIGIN} environment is authorized`);
      }
      return config;
    }
  },
  env: {
    INVALID_TOKEN: required('INVALID_TOKEN'),
    MOBILE_VIEWPORT_WIDTH: number('MOBILE_VIEWPORT_WIDTH'),
    MOBILE_VIEWPORT_HEIGHT: number('MOBILE_VIEWPORT_HEIGHT')
  },
  retries: 0,
  video: false,
  screenshotOnRunFailure: false,
  requestTimeout: number('REQUEST_TIMEOUT'),
  responseTimeout: number('RESPONSE_TIMEOUT'),
  viewportWidth: number('VIEWPORT_WIDTH'),
  viewportHeight: number('VIEWPORT_HEIGHT')
});
