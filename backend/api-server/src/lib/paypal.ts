import {
  Client,
  Environment,
  LogLevel,
  OrdersController,
} from "@paypal/paypal-server-sdk";

const clientId = process.env.PAYPAL_CLIENT_ID;
const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
const isProduction = process.env.NODE_ENV === "production";

if (!clientId || !clientSecret) {
  console.warn("PAYPAL_CLIENT_ID or PAYPAL_CLIENT_SECRET is not configured");
}

export const paypalClient = new Client({
  clientCredentialsAuthCredentials: {
    oAuthClientId: clientId || "",
    oAuthClientSecret: clientSecret || "",
  },
  environment: isProduction ? Environment.Production : Environment.Sandbox,
  logging: {
    logLevel: LogLevel.Info,
    logRequest: { logBody: true },
    logResponse: { logBody: true },
  },
});

export const ordersController = new OrdersController(paypalClient);
