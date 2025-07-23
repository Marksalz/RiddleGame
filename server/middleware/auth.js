import jwt from "jsonwebtoken";
import { playerSupabase } from "../lib/players/playerDb.js";


export const verifyToken = async (req, res, next) => {
    try {
        let token = req.cookies.token;

        // If no token in parsed cookies, try to parse from header manually
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

        // Verify the token contains both id and username
        if (!decoded.id || !decoded.username) {
            req.authenticated = false;
            return next();
        }

        // Try to find user by ID and verify username matches
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
        // Token expired or invalid
        req.authenticated = false;
        req.tokenExpired = err.name === 'TokenExpiredError';
        next();
    }
};

export const checkUserExists = async (req, res, next) => {
    try {
        const { username } = req.body;
        const { data: user, error } = await playerSupabase
            .from('players')
            .select('*')
            .ilike('username', username)  // Use case-insensitive search
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

// export const requireAuth = (req, res, next) => {
//     if (!req.authenticated || !req.user) {
//         return res.status(401).json({ error: 'Authentication required' });
//     }
//     next();
// };

// export const requireRole = (allowedRoles) => {
//     return (req, res, next) => {
//         if (!req.authenticated || !req.user) {
//             return res.status(401).json({ error: 'Authentication required' });
//         }

//         const userRole = req.user.role || 'guest';
//         if (!allowedRoles.includes(userRole)) {
//             return res.status(403).json({ error: 'Insufficient permissions' });
//         }

//         next();
//     };
// };
// if (!req.authenticated || !req.user) {
//     return res.status(401).json({ error: 'Authentication required' });
// }

// const userRole = req.user.role || 'guest';
// if (!allowedRoles.includes(userRole)) {
//     return res.status(403).json({ error: 'Insufficient permissions' });
// }

// next();
//         const userRole = req.user.role || 'guest';
//         if (!allowedRoles.includes(userRole)) {
//             return res.status(403).json({ error: 'Insufficient permissions' });
//         }

//         next();
//     };
// };
// if (!req.authenticated || !req.user) {
//     return res.status(401).json({ error: 'Authentication required' });
// }

// const userRole = req.user.role || 'guest';
// if (!allowedRoles.includes(userRole)) {
//     return res.status(403).json({ error: 'Insufficient permissions' });
// }

// next();
