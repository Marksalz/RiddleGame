import express from "express";
import { playerCtrl } from "../controllers/playerController.js";
import { updatePlayerTime } from "../controllers/playerController.js";
const playerRouter = express.Router();

playerRouter.post("/create_player", async (req, res) => {
    try {
        const { name } = req.body;
        const player = await playerCtrl.getOrCreatePlayer(name);
        res.json(player);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

playerRouter.get("/leaderboard", async (req, res) => {
    try {
        const leaderboard = await playerCtrl.getLeaderboard();
        res.json(leaderboard);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


playerRouter.put("/update_time/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);
        const { time } = req.body;
        await updatePlayerTime(id, time);
        res.json({ message: "Player time updated successfully" });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

export default playerRouter;