import express from "express";
const playerRouter = express.Router();

playerRouter.post("/create_player", /* controller or handler */);
playerRouter.get("/leaderboard", /* controller or handler */);

export default playerRouter;