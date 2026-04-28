import { Router, type IRouter } from "express";
import { buildPricingContext } from "../lib/pricing";

const router: IRouter = Router();

router.get("/pricing-context", (req, res) => {
  const locale = typeof req.query.locale === "string" ? req.query.locale : undefined;
  return res.json(buildPricingContext(locale));
});

export default router;
