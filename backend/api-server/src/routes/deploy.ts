import { Router, type IRouter } from "express";
import { DeployToWordpressBody, DeployToShopifyBody, DeployToWordpressResponse } from "@workspace/api-zod";
import { requireAuthenticatedUser } from "../middleware/auth";

const router: IRouter = Router();
router.use(requireAuthenticatedUser);

router.post("/deploy/wordpress", async (req, res) => {
  const parsed = DeployToWordpressBody.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid request body" });
  }
  const { siteUrl, username, appPassword, postType, postId, html } = parsed.data;

  let base: URL;
  try {
    base = new URL(siteUrl);
  } catch {
    return res.status(400).json({ message: "Invalid WordPress site URL." });
  }
  if (base.protocol !== "https:") {
    return res.status(400).json({ message: "WordPress deployments require an HTTPS site URL." });
  }

  const endpoint = `${base.origin}/wp-json/wp/v2/${postType}/${postId}`;
  const auth = "Basic " + Buffer.from(`${username}:${appPassword}`).toString("base64");

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20_000);
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: auth,
        "User-Agent": "SEOaxe/1.0",
      },
      body: JSON.stringify({ content: html }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!response.ok) {
      const errBody = await response.text().catch(() => "");
      req.log.error({ status: response.status, body: errBody.slice(0, 300) }, "WordPress deploy failed");
      const message =
        response.status === 401 || response.status === 403
          ? "WordPress rejected the credentials. Check the username and application password."
          : response.status === 404
          ? "WordPress page or post ID not found."
          : "Deploy failed, please try again.";
      return res.status(500).json({ message });
    }

    const data = (await response.json().catch(() => ({}))) as { link?: string };
    const safe = DeployToWordpressResponse.parse({
      success: true,
      message: "Pushed to WordPress successfully.",
      url: data.link ?? null,
    });
    return res.json(safe);
  } catch (err) {
    req.log.error({ err }, "WordPress fetch failed");
    return res.status(500).json({ message: "Deploy failed, please try again." });
  }
});

router.post("/deploy/shopify", async (req, res) => {
  const parsed = DeployToShopifyBody.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid request body" });
  }
  const { shop, accessToken, pageId, html } = parsed.data;

  const cleanShop = shop
    .trim()
    .replace(/^https?:\/\//, "")
    .replace(/\/$/, "");
  if (!/^[a-z0-9-]+\.myshopify\.com$/i.test(cleanShop)) {
    return res
      .status(400)
      .json({ message: "Shopify shop must look like your-store.myshopify.com." });
  }

  const endpoint = `https://${cleanShop}/admin/api/2024-10/pages/${pageId}.json`;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20_000);
    const response = await fetch(endpoint, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": accessToken,
        "User-Agent": "SEOaxe/1.0",
      },
      body: JSON.stringify({ page: { id: pageId, body_html: html } }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!response.ok) {
      const errBody = await response.text().catch(() => "");
      req.log.error({ status: response.status, body: errBody.slice(0, 300) }, "Shopify deploy failed");
      const message =
        response.status === 401 || response.status === 403
          ? "Shopify rejected the access token. Check it has write_content scope."
          : response.status === 404
          ? "Shopify page ID not found."
          : "Deploy failed, please try again.";
      return res.status(500).json({ message });
    }

    const data = (await response.json().catch(() => ({}))) as { page?: { handle?: string } };
    const url = data.page?.handle ? `https://${cleanShop}/pages/${data.page.handle}` : null;
    const safe = DeployToWordpressResponse.parse({
      success: true,
      message: "Pushed to Shopify successfully.",
      url,
    });
    return res.json(safe);
  } catch (err) {
    req.log.error({ err }, "Shopify fetch failed");
    return res.status(500).json({ message: "Deploy failed, please try again." });
  }
});

export default router;
