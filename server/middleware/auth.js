/**
 * @fileoverview Authentication middleware for JWT token verification and user validation.
 * Provides token verification and user existence checking functionality.
 * @author RiddleGame Team
 */

import jwt from "jsonwebtoken";
import { playerSupabase } from "../lib/players/playerDb.js";

/**
 * Middleware to check if a user exists in the database
 * Sets user existence status on the request object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object  
 * @param {Function} next - Express next middleware function
 * @description Queries database for username and sets req.userExists, req.existingUser
 */
export const checkUserExists = async (req, res, next) => {
    try {
        const { username } = req.body;
        // Case-sensitive username lookup
        const { data: user, error } = await playerSupabase
            .from('players')
            .select('*')
            .eq('username', username)
            .single();

        req.userExists = !!user && !error;
        req.existingUser = user;
        next();
    } catch (err) {
        // Set default values on error
        req.userExists = false;
        req.existingUser = null;
        next();
    }
};

/**
 * Middleware to verify JWT tokens from cookies or headers
 * Sets authentication status and user data on the request object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @description Checks for JWT token in cookies, verifies it, and validates user existence
 * Sets req.authenticated, req.user, req.tokenData, req.tokenExpired, req.tokenError
 */
export const verifyToken = async (req, res, next) => {
    try {
        // Extract token from cookies or headers
        let token = req.cookies.token;

        // Fallback: Parse token from cookie header if not found in parsed cookies
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

        // Check if user exists and is a guest - allow direct access without token
        if (!token && req.userExists && req.existingUser && req.existingUser.role === 'guest') {
            req.authenticated = true;
            req.user = req.existingUser;
            req.guestLogin = true;
            return next();
        }

        // No token found - set as unauthenticated
        if (!token) {
            req.authenticated = false;
            return next();
        }

        // Verify JWT token
        const decoded = jwt.verify(token, process.env.SECRET);

        // Validate token payload structure
        if (!decoded.id || !decoded.username) {
            req.authenticated = false;
            return next();
        }

        // Verify user still exists in database
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

        // Set authentication data on request
        req.user = user;
        req.authenticated = true;
        req.tokenData = decoded;
        next();
    } catch (err) {
        req.authenticated = false;

        // Set specific error types for client handling
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