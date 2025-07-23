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
            return JSON.parse(data);
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
    tokenCache[username] = token;
    saveTokensToFile();
}

export function getToken(username) {
    return tokenCache[username] || null;
}

export function clearToken(username) {
    delete tokenCache[username];
    saveTokensToFile();
}

export function hasValidToken(username) {
    return !!getToken(username);
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
