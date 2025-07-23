import fs from 'fs';
import path from 'path';

// Token storage file path
const TOKEN_FILE = path.join(process.cwd(), '.auth-tokens.json');

// In-memory token cache
let tokenCache = loadTokensFromFile();

function loadTokensFromFile() {
    try {
        if (fs.existsSync(TOKEN_FILE)) {
            const data = fs.readFileSync(TOKEN_FILE, 'utf8');
            const tokens = JSON.parse(data);

            // Clean up expired tokens
            const now = Date.now();
            const validTokens = {};

            for (const [username, tokenData] of Object.entries(tokens)) {
                if (tokenData.expiresAt && tokenData.expiresAt > now) {
                    validTokens[username] = tokenData;
                } else if (!tokenData.expiresAt) {
                    // No expiration set, keep it
                    validTokens[username] = tokenData;
                }
            }

            // Save cleaned tokens back to file if any were removed
            if (Object.keys(validTokens).length !== Object.keys(tokens).length) {
                saveTokensToFile(validTokens);
            }

            return validTokens;
        }
    } catch (err) {
        console.log('Note: Could not load saved tokens:', err.message);
    }
    return {};
}

function saveTokensToFile(tokens = null) {
    try {
        const tokensToSave = tokens || tokenCache;
        fs.writeFileSync(TOKEN_FILE, JSON.stringify(tokensToSave, null, 2));
    } catch (err) {
        console.log('Note: Could not save tokens:', err.message);
    }
}

export function setToken(username, token) {
    const expiresAt = Date.now() + (7 * 24 * 60 * 60 * 1000); // 1 week
    tokenCache[username] = {
        token: token,
        expiresAt: expiresAt,
        createdAt: Date.now()
    };
    saveTokensToFile();
}

export function getToken(username) {
    // Clean expired tokens first
    tokenCache = loadTokensFromFile();

    const tokenData = tokenCache[username];
    if (!tokenData) return null;

    // Check if token is expired
    if (tokenData.expiresAt && tokenData.expiresAt <= Date.now()) {
        delete tokenCache[username];
        saveTokensToFile();
        return null;
    }

    return tokenData.token;
}

export function clearToken(username) {
    delete tokenCache[username];
    saveTokensToFile();
}

export function clearAllTokens() {
    tokenCache = {};
    saveTokensToFile();

    // Also delete the file
    try {
        if (fs.existsSync(TOKEN_FILE)) {
            fs.unlinkSync(TOKEN_FILE);
        }
    } catch (err) {
        console.log('Note: Could not delete token file:', err.message);
    }
}

export function hasValidToken(username) {
    return !!getToken(username);
}

export function getTokenInfo(username) {
    const tokenData = tokenCache[username];
    if (!tokenData) return null;

    const remainingTime = Math.max(0, tokenData.expiresAt - Date.now());
    const remainingDays = Math.floor(remainingTime / (24 * 60 * 60 * 1000));
    const remainingHours = Math.floor((remainingTime % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));

    return {
        username: username,
        remainingDays: remainingDays,
        remainingHours: remainingHours,
        expiresAt: tokenData.expiresAt
    };
}

export function getHeaders(username = null, includeToken = true) {
    const headers = {
        "Content-Type": "application/json"
    };

    if (includeToken && username) {
        const token = getToken(username);
        if (token) {
            headers.Cookie = `token=${token}`;
        }
    }

    return headers;
}
