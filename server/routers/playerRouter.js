import express from "express";
import { playerCtrl } from "../controllers/playerController.js";
const playerRouter = express.Router();

playerRouter.post("/create_player", async (req, res) => {
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

playerRouter.post("/record_solved_riddle", async (req, res) => {
    try {
        const { player_id, riddle_id, time_to_solve } = req.body;
        const score = await playerCtrl.recordSolvedRiddle(player_id, riddle_id, time_to_solve);
        res.json(score);
    } catch (err) {
        res.status(400).json({ error: "Failed to record solved riddle.", details: err.message });
    }
});

playerRouter.get("/unsolved_riddles/:player_id", async (req, res) => {
    try {
        const player_id = Number(req.params.player_id);
        const difficulty = req.query.difficulty;
        const riddles = await playerCtrl.getUnsolvedRiddles(player_id, difficulty);
        res.json(riddles);
    } catch (err) {
        res.status(400).json({ error: "Failed to get unsolved riddles.", details: err.message });
    }
});

export default playerRouter;