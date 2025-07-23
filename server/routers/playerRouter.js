import express from "express";
import { playerCtrl } from "../controllers/playerController.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
//import { getPlayerCollection } from "";
import { playerSupabase } from "../lib/players/playerDb.js";
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

        // Validate role
        const validRoles = ['guest', 'user', 'admin'];
        if (!validRoles.includes(role)) {
            return res.status(400).json({ error: 'Invalid role specified' });
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        const player = await playerCtrl.createPlayer(username, hashedPassword, role);

        // Generate user-specific token with 1-week expiration
        const token = jwt.sign(
            {
                id: player.id,
                username: player.username,
                role: player.role || 'user'
            },
            process.env.SECRET,
            { expiresIn: '7d' }
        );

        // Set cookie with 1-week expiration
        res.cookie("token", token, {
            httpOnly: false,
            sameSite: "lax",
            secure: false,
            maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week in milliseconds
            path: '/'
        });

        res.status(201).json({
            ...player,
            token: token,
            expiresIn: '7d'
        });
    } catch (err) {
        console.error("Failed to create player:", err);
        res.status(err.status || 500).json({ error: err.message || 'Server internal error' });
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

        // Check if token expired
        if (req.tokenExpired) {
            return res.json({
                authenticated: false,
                tokenExpired: true,
                userExists: req.userExists,
                message: 'Token expired, please log in again'
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

        if (error || !user) {
            return res.status(403).json({ error: 'User not found' });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) return res.status(403).json({ error: 'Invalid password' });

        // Generate user-specific token with 1-week expiration
        const token = jwt.sign(
            {
                id: user.id,
                username: user.username,
                role: user.role || 'guest'
            },
            process.env.SECRET,
            { expiresIn: '7d' }
        );

        // Set cookie with 1-week expiration
        res.cookie("token", token, {
            httpOnly: false,
            sameSite: "lax",
            secure: false,
            maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week in milliseconds
            path: '/'
        });

        res.json({
            message: 'Login successful!',
            token: token,
            user: {
                id: user.id,
                username: user.username,
                role: user.role || 'guest',
                lowestTime: user.lowestTime
            },
            expiresIn: '7d'
        });
    } catch (err) {
        res.status(500).json({ error: 'Server error', details: err.message });
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
    // Clear cookie with multiple path configurations to ensure removal
    res.clearCookie('token');
    res.clearCookie('token', { path: '/' });
    res.clearCookie('token', { path: '/api/' });
    res.json({ message: 'Logged out successfully' });
});

export default playerRouter;