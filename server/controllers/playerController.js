import * as crud from "../DAL/playerCrud.js";
import * as scoreCrud from "../DAL/playerScoreCrud.js";
import * as riddleCrud from "../DAL/riddleCrud.js";
import { playerSupabase } from "../lib/players/playerDb.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export async function getOrCreatePlayer(username) {
    try {
        validatePlayerName(username);
        let player = await crud.readByUsername(username);
        if (!player) {
            player = { username, lowestTime: null };
            player = await crud.create(player);
        }
        return player;
    } catch (err) {
        throw new Error("Could not get or create player: " + err.message);
    }
}

export async function createPlayer(username, hashedPassword, role = 'user') {
    try {
        validatePlayerName(username);
        let player = { username, password: hashedPassword, role, lowestTime: null };
        player = await crud.create(player);
        return player;
    } catch (err) {
        throw new Error("Could not get or create player: " + err.message);
    }
}

export async function getLeaderboard() {
    try {
        const players = await crud.read();
        return players
            .filter(p => typeof p.lowestTime === "number")
            .sort((a, b) => a.lowestTime - b.lowestTime);
    } catch (err) {
        throw new Error("Could not get leaderboard: " + err.message);
    }
}

function validatePlayerName(name) {
    if (!name || typeof name !== "string" || name.trim().length === 0) {
        throw new Error("Invalid player name.");
    }
}

export async function updatePlayerTime(id, time) {
    try {
        const player = await crud.readById(id);
        if (!player) throw new Error("Player not found");
        if (player.lowestTime === null || time < player.lowestTime) {
            await crud.update(id, { lowestTime: time });
        }
    } catch (err) {
        console.log(err.message);

        throw new Error("Could not update player time: " + err.message);
    }
}

export async function recordSolvedRiddle(player_id, riddle_id, time_to_solve) {
    try {
        return await scoreCrud.createScore({ player_id, riddle_id, time_to_solve });
    } catch (err) {
        throw new Error("Could not record solved riddle: " + err.message);
    }
}

export async function getUnsolvedRiddles(player_id, difficulty) {
    try {
        const solvedIds = await scoreCrud.getSolvedRiddleIds(player_id);
        console.log(solvedIds);
        let riddles = await riddleCrud.getRiddles();
        if (difficulty) {
            riddles = riddles.filter(r => r.difficulty === difficulty);
        }
        return riddles.filter(r => !solvedIds.includes(String(r._id)));
    } catch (err) {
        throw new Error("Could not get unsolved riddles: " + err.message);
    }
}

export async function checkUserAuthentication(username, req) {
    try {
        if (req.authenticated && req.user && req.user.username === username) {
            return {
                authenticated: true,
                user: {
                    id: req.user.id,
                    username: req.user.username,
                    role: req.user.role || 'guest',
                    lowestTime: req.user.lowestTime
                },
                message: 'User authenticated with existing token'
            };
        }

        if (req.tokenExpired) {
            return {
                authenticated: false,
                tokenExpired: true,
                userExists: req.userExists,
                tokenError: req.tokenError,
                message: 'Token expired, please log in again'
            };
        }

        if (req.tokenError) {
            return {
                authenticated: false,
                tokenExpired: false,
                userExists: req.userExists,
                tokenError: req.tokenError,
                message: 'Invalid token, please log in again'
            };
        }

        if (req.userExists) {
            return {
                authenticated: false,
                userExists: true,
                message: 'User exists, password required'
            };
        }

        return {
            authenticated: false,
            userExists: false,
            message: 'User not found, signup required'
        };
    } catch (err) {
        throw new Error("Could not check user authentication: " + err.message);
    }
}

export async function signupPlayer(username, password, role = 'user') {
    try {
        const validRoles = ['guest', 'user', 'admin'];
        if (!validRoles.includes(role)) {
            throw new Error('Invalid role specified');
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        const player = await createPlayer(username, hashedPassword, role);

        const token = jwt.sign(
            {
                id: player.id,
                username: player.username,
                role: player.role || 'user'
            },
            process.env.SECRET,
            { expiresIn: '7d' }
        );

        return {
            player: player,
            token: token,
            expiresIn: '7d'
        };
    } catch (err) {
        throw new Error("Could not signup player: " + err.message);
    }
}

export async function loginPlayer(username, password) {
    try {

        const { data: user, error } = await playerSupabase
            .from('players')
            .select('*')
            .eq('username', username)
            .single();

        if (error || !user) {
            throw new Error('User not found');
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            throw new Error('Invalid password');
        }

        const token = jwt.sign(
            {
                id: user.id,
                username: user.username,
                role: user.role || 'guest'
            },
            process.env.SECRET,
            { expiresIn: '7d' }
        );

        return {
            message: 'Login successful!',
            token: token,
            user: {
                id: user.id,
                username: user.username,
                role: user.role || 'guest',
                lowestTime: user.lowestTime
            },
            expiresIn: '7d'
        };
    } catch (err) {
        throw new Error("Could not login player: " + err.message);
    }
}

export const playerCtrl = {
    getOrCreatePlayer,
    createPlayer,
    getLeaderboard,
    updatePlayerTime,
    recordSolvedRiddle,
    getUnsolvedRiddles,
    checkUserAuthentication,
    signupPlayer,
    loginPlayer
};