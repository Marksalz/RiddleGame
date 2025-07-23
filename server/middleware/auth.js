import jwt from "jsonwebtoken";
import { playerSupabase } from "../lib/players/playerDb.js";

export const verifyToken = async (req, res, next) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            req.authenticated = false;
            return next();
        }

        const decoded = jwt.verify(token, process.env.SECRET);
        const { data: user, error } = await playerSupabase
            .from('players')
            .select('*')
            .eq('id', decoded.id)
            .single();

        if (error || !user) {
            req.authenticated = false;
            return next();
        }

        req.user = user;
        req.authenticated = true;
        next();
    } catch (err) {
        req.authenticated = false;
        next();
    }
};

export const checkUserExists = async (req, res, next) => {
    try {
        const { username } = req.body;
        const { data: user, error } = await playerSupabase
            .from('players')
            .select('*')
            .eq('username', username)
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

export const requireAuth = (req, res, next) => {
    if (!req.authenticated || !req.user) {
        return res.status(401).json({ error: 'Authentication required' });
    }
    next();
};

export const requireRole = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.authenticated || !req.user) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const userRole = req.user.role || 'guest';
        if (!allowedRoles.includes(userRole)) {
            return res.status(403).json({ error: 'Insufficient permissions' });
        }

        next();
    };
};
