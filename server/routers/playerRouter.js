import express from "express";
import { playerCtrl } from "../controllers/playerController.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { getPlayerCollection } from "../db/playerDb.js";
import { playerSupabase } from "../lib/players/playerDb.js";
import { verifyToken, checkUserExists, requireAuth, requireRole } from "../middleware/auth.js";
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
        const { username, password, role = 'guest' } = req.body;
        const hashedPassword = await bcrypt.hash(password, 12);
        const player = await playerCtrl.createPlayer(username, hashedPassword, role);
        res.status(201).json(player);
    } catch (err) {
        console.error("Failed to create or get player:", err);
        res.status(err.status || 500).send(err.message || 'Server internal error');
    }
});

playerRouter.post('/check-user', checkUserExists, verifyToken, async (req, res) => {
    try {
        const { username } = req.body;

        // If user is already authenticated with valid token
        if (req.authenticated && req.user && req.user.username === username) {
            return res.json({
                authenticated: true,
                user: {
                    id: req.user.id,
                    username: req.user.username,
                    role: req.user.role || 'guest',
                    lowestTime: req.user.lowestTime
                },
                message: 'User authenticated with existing token'
            });
        }

        // If user exists but no valid token
        if (req.userExists) {
            return res.json({
                authenticated: false,
                userExists: true,
                message: 'User exists, password required'
            });
        }

        // User doesn't exist
        return res.json({
            authenticated: false,
            userExists: false,
            message: 'User not found, signup required'
        });
    } catch (err) {
        res.status(500).json({ error: 'Server error', details: err.message });
    }
});

playerRouter.post('/login-with-name', async (req, res) => {
    try {
        const { username, password } = req.body;
        const { data: user, error } = await playerSupabase
            .from('players')
            .select('*')
            .eq('username', username)
            .single();

        if (error || !user) return res.status(403).json({ error: 'User not found' });

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) return res.status(403).json({ error: 'Invalid password' });

        const token = jwt.sign({ id: user.id }, process.env.SECRET, {
            expiresIn: '7d'
        });

        res.cookie("token", token, { httpOnly: true, sameSite: "strict" })
            .json({
                message: 'Login successful!',
                user: {
                    id: user.id,
                    username: user.username,
                    role: user.role || 'guest',
                    lowestTime: user.lowestTime
                }
            });
    } catch (err) {
        res.status(500).json({ error: 'Server error', details: err.message });
    }
});

playerRouter.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const collection = await getPlayerCollection();
        const user = await collection.findOne({ username: username });
        if (!user) return res.status(403).send('User not found');
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) return res.status(403).send('User not found');
        const token = jwt.sign({ id: user._id }, process.env.SECRET, {
            expiresIn: '7d'
        });
        res.cookie("token", token, { httpOnly: true, sameSite: "strict" }).send('login successful!');
    } catch (err) {
        res.status(err.status || 500).send(err.message || 'Server internal error');
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