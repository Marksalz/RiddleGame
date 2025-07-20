import express from "express";
import { playerCtrl } from "../controllers/playerController.js";
const playerRouter = express.Router();

playerRouter.post("/create_player", async (req, res) => {
    //console.log("[POST] /players/create_player", req.body);
    try {
        const { name } = req.body;
        const player = await playerCtrl.getOrCreatePlayer(name);
        console.log("Player created or fetched:", player);
        res.json(player);
    } catch (err) {
        console.error("Failed to create or get player:", err);
        res.status(400).json({ error: "Failed to create or get player.", details: err.message });
    }
});

playerRouter.get("/leaderboard", async (req, res) => {
    //console.log("[GET] /players/leaderboard");
    try {
        const leaderboard = await playerCtrl.getLeaderboard();
        console.log("Leaderboard fetched:", leaderboard);
        res.json(leaderboard);
    } catch (err) {
        console.error("Failed to fetch leaderboard:", err);
        res.status(500).json({ error: "Failed to fetch leaderboard.", details: err.message });
    }
});


playerRouter.put("/update_time/:id", async (req, res) => {
    //console.log(`[PUT] /players/update_time/${req.params.id}`, req.body);
    try {
        const id = Number(req.params.id);
        const { time } = req.body;

        await playerCtrl.updatePlayerTime(id, time);
        console.log(`Player ${id} time updated to ${time}`);
        res.json({ message: "Player time updated successfully" });
    } catch (err) {
        console.error("Failed to update player time:", err);
        res.status(400).json({ error: "Failed to update player time.", details: err.message });
    }
});

export default playerRouter;