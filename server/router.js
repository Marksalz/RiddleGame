import express from "express";
import riddleRouter from "./routers/riddleRouter.js";
import playerRouter from "./routers/playerRouter.js";

const router = express.Router();

router.use("/riddles", riddleRouter);
router.use("/players", playerRouter);

export default router;