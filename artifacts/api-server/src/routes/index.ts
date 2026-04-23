import { Router, type IRouter } from "express";
import healthRouter from "./health";
import optimizeRouter from "./optimize";
import competitorRouter from "./competitor";
import crawlRouter from "./crawl";
import aeoRouter from "./aeo";
import deployRouter from "./deploy";
import optimizationsRouter from "./optimizations";
import agencyRouter from "./agency";
import sitemapRouter from "./sitemap";
import hreflangRouter from "./hreflang";
import contentGapsRouter from "./content-gaps";
import siteMonitorRouter from "./site-monitor";

const router: IRouter = Router();

router.use(healthRouter);
router.use(optimizeRouter);
router.use(competitorRouter);
router.use(crawlRouter);
router.use(aeoRouter);
router.use(deployRouter);
router.use(optimizationsRouter);
router.use(agencyRouter);
router.use(sitemapRouter);
router.use(hreflangRouter);
router.use(contentGapsRouter);
router.use(siteMonitorRouter);

export default router;
