import { Router, type IRouter } from "express";
import healthRouter from "./health";

const router: IRouter = Router();

router.use(healthRouter);

router.get("/", (_req, res) => {
  res.json({ status: "ok" });
});

export default router;
