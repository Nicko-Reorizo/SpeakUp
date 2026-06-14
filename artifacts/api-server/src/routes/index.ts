import { Router, type IRouter } from "express";
import healthRouter from "./health";
import classesRouter from "./classes";

const router: IRouter = Router();

router.use(healthRouter);
router.use(classesRouter);

export default router;
