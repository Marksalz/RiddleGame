import jwt from "jsonwebtoken";
import { playerSupabase } from "../lib/players/playerDb.js";


export const verifyToken = async (req, res, next) => {
    try {
        let token = req.cookies.token;

        if (!token && req.headers.cookie) {
            const cookies = req.headers.cookie.split(';');
            for (const cookie of cookies) {
                const [name, value] = cookie.trim().split('=');
                if (name === 'token') {
                    token = value;
                    break;
                }
            }
        }

        if (!token) {
            req.authenticated = false;
            return next();
        }

        const decoded = jwt.verify(token, process.env.SECRET);

        if (!decoded.id || !decoded.username) {
            req.authenticated = false;
            return next();
        }

        const { data: user, error } = await playerSupabase
            .from('players')
            .select('*')
            .eq('id', decoded.id)
            .eq('username', decoded.username)
            .single();

        if (!user || error) {
            req.authenticated = false;
            return next();
        }

        req.user = user;
        req.authenticated = true;
        req.tokenData = decoded;
        next();
    } catch (err) {
        req.authenticated = false;

        if (err.name === 'TokenExpiredError') {
            req.tokenExpired = true;
            req.tokenError = 'Token has expired';
        } else if (err.name === 'JsonWebTokenError') {
            req.tokenExpired = false;
            req.tokenError = 'Invalid token';
        } else if (err.name === 'NotBeforeError') {
            req.tokenExpired = false;
            req.tokenError = 'Token not active yet';
        } else {
            req.tokenExpired = false;
            req.tokenError = 'Authentication error';
        }
        next();
    }
};

export const checkUserExists = async (req, res, next) => {
    try {
        const { username } = req.body;
        const { data: user, error } = await playerSupabase
            .from('players')
            .select('*')
            .ilike('username', username)
            .single();

        req.userExists = !!user && !error;
        req.existingUser = user;
        next();
    } catch (err) {
        req.userExists = false;
        req.existingUser = null;
        next();
    }
};