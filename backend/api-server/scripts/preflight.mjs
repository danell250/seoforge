const requiredEnv = [
  "PORT",
  "DATABASE_URL",
  "ADMIN_EMAIL",
  "ADMIN_PASSWORD",
  "PAYPAL_CLIENT_ID",
  "PAYPAL_CLIENT_SECRET",
  "PAYPAL_WEBHOOK_SECRET",
];

const optionalButRecommended = [
  "GEMINI_API_KEY",
  "STITCH_EXPRESS_CLIENT_ID",
  "STITCH_EXPRESS_CLIENT_SECRET",
  "STITCH_EXPRESS_WEBHOOK_SECRET",
];

function read(name) {
  const value = process.env[name];
  return typeof value === "string" ? value.trim() : "";
}

const missingRequired = requiredEnv.filter((key) => !read(key));
const missingOptional = optionalButRecommended.filter((key) => !read(key));

if (missingRequired.length > 0) {
  console.error("Production preflight failed. Missing required environment variables:");
  for (const key of missingRequired) {
    console.error(`- ${key}`);
  }
  process.exit(1);
}

console.log("Production preflight passed: required environment variables are set.");

if (missingOptional.length > 0) {
  console.warn("Recommended variables not set (some features may run in fallback mode):");
  for (const key of missingOptional) {
    console.warn(`- ${key}`);
  }
}

