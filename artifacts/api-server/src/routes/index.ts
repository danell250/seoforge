import { Router, type IRouter } from "express";
import healthRouter from "./health";
import optimizeRouter from "./optimize";
import competitorRouter from "./competitor";
import crawlRouter from "./crawl";

const router: IRouter = Router();

router.use(healthRouter);
router.use(optimizeRouter);
router.use(competitorRouter);
router.use(crawlRouter);

export default router;
