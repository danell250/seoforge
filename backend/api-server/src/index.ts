import app from "./app";
import { ensureAgencySettingsSchema, normalizeStoredAgencyBrandName } from "./lib/agency-settings";
import { logger } from "./lib/logger";
import { startScheduler } from "./lib/scheduler";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

// --- Startup environment validation ---
// These are the minimum env vars required to start. Missing any of them in
// production is a hard failure so deployments don't silently run in a broken state.
const REQUIRED_ENV_VARS = [
  "DATABASE_URL",
  "ADMIN_EMAIL",
  "ADMIN_PASSWORD",
] as const;

const RECOMMENDED_ENV_VARS = [
  "GEMINI_API_KEY",
  "PAYPAL_CLIENT_ID",
  "PAYPAL_CLIENT_SECRET",
  "PAYPAL_WEBHOOK_ID",
] as const;

function runStartupEnvCheck() {
  const missing = REQUIRED_ENV_VARS.filter((key) => !process.env[key]?.trim());
  if (missing.length > 0) {
    for (const key of missing) {
      logger.error({ key }, `Missing required environment variable: ${key}`);
    }
    if (process.env.NODE_ENV === "production") {
      logger.fatal("Aborting startup due to missing required environment variables.");
      process.exit(1);
    } else {
      logger.warn("Missing required env vars — continuing in development mode with degraded functionality.");
    }
  }

  const notSet = RECOMMENDED_ENV_VARS.filter((key) => !process.env[key]?.trim());
  if (notSet.length > 0) {
    logger.warn(
      { vars: notSet },
      "Recommended environment variables are not set — some features may run in fallback mode.",
    );
  }
}

async function start() {
  runStartupEnvCheck();
  await ensureAgencySettingsSchema();
  await normalizeStoredAgencyBrandName();
  app.listen(port, (err) => {
    if (err) {
      logger.error({ err }, "Error listening on port");
      process.exit(1);
    }

    logger.info({ port }, "Server listening");
    startScheduler();
  });
}

start().catch((err) => {
  logger.error({ err }, "Server startup failed");
  process.exit(1);
});
