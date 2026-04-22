import { Router, type IRouter } from "express";
import healthRouter from "./health";
import optimizeRouter from "./optimize";
import competitorRouter from "./competitor";
import crawlRouter from "./crawl";
import aeoRouter from "./aeo";
import deployRouter from "./deploy";
import optimizationsRouter from "./optimizations";

const router: IRouter = Router();

router.use(healthRouter);
router.use(optimizeRouter);
router.use(competitorRouter);
router.use(crawlRouter);
router.use(aeoRouter);
router.use(deployRouter);
router.use(optimizationsRouter);

export default router;
