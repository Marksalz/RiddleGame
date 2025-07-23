import express from "express";
import { playerCtrl } from "../controllers/playerController.js";
import { verifyToken, checkUserExists } from "../middleware/auth.js";
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

playerRouter.post('/signup', async (req, res) => {
    try {
        const { username, password, role = 'user' } = req.body;

        const result = await playerCtrl.signupPlayer(username, password, role);

        res.cookie("token", result.token, {
            httpOnly: false,
            sameSite: "lax",
            secure: false,
            maxAge: 7 * 24 * 60 * 60 * 1000,
            path: '/'
        });

        res.status(201).json({
            ...result.player,
            token: result.token,
            expiresIn: result.expiresIn
        });
    } catch (err) {
        console.error("Failed to create player:", err);
        res.status(500).json({ error: err.message || 'Server internal error' });
    }
});

playerRouter.post('/check-user', checkUserExists, verifyToken, async (req, res) => {
    try {
        const { username } = req.body;

        const result = await playerCtrl.checkUserAuthentication(username, req);

        // Handle token expiration specifically
        if (req.tokenExpired) {
            return res.status(401).json({
                ...result,
                tokenExpired: true,
                tokenError: req.tokenError
            });
        }

        // Handle other token errors
        if (req.tokenError && !req.authenticated) {
            return res.status(401).json({
                ...result,
                tokenError: req.tokenError
            });
        }

        res.json(result);
    } catch (err) {
        res.status(500).json({ error: 'Server error', details: err.message });
    }
});

playerRouter.post('/login-with-name', async (req, res) => {
    try {
        const { username, password } = req.body;

        const result = await playerCtrl.loginPlayer(username, password);

        res.cookie("token", result.token, {
            httpOnly: false,
            sameSite: "lax",
            secure: false,
            maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week in milliseconds
            path: '/'
        });

        res.json(result);
    } catch (err) {
        res.status(403).json({ error: err.message });
    }
});

playerRouter.get("/leaderboard", async (req, res) => {
    try {
        const leaderboard = await playerCtrl.getLeaderboard();
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

playerRouter.post('/logout', (req, res) => {
    res.clearCookie('token');
    res.clearCookie('token', { path: '/' });
    res.clearCookie('token', { path: '/api/' });
    res.json({ message: 'Logged out successfully' });
});

export default playerRouter;