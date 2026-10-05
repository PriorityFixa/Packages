/* =========================================================
   ADMIN AUTH — shared across login.html and dashboard.html
========================================================= */

const API_URL = "https://priorityfixa-income-api.priorityfixa.workers.dev";
const AUTH_TOKEN_KEY = "priorityfixa_admin_token";


/* =========================
   TOKEN STORAGE
========================= */

function getAuthToken() {
    return localStorage.getItem(AUTH_TOKEN_KEY);
}

function setAuthToken(token) {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
}

function clearAuthToken() {
    localStorage.removeItem(AUTH_TOKEN_KEY);
}


/* =========================
   GUARD A PAGE
   Call this at the top of any admin-only page. Redirects to
   login.html if there's no token, or if the token has expired.
========================= */

async function requireAdminAuth() {
    const token = getAuthToken();

    if (!token) {
        window.location.href = "login.html";
        return false;
    }

    try {
        const response = await fetch(`${API_URL}/admin/stats`, {
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (response.status === 401) {
            clearAuthToken();
            window.location.href = "login.html";
            return false;
        }

        return true;

    } catch (error) {
        console.error("Auth check failed:", error);
        return false;
    }
}


/* =========================
   AUTHENTICATED FETCH
   Wraps fetch() to attach the token and handle expiry.
========================= */

async function authFetch(path, options = {}) {
    const token = getAuthToken();

    const response = await fetch(`${API_URL}${path}`, {
        ...options,
        headers: {
            ...(options.headers || {}),
            "Authorization": `Bearer ${token}`
        }
    });

    if (response.status === 401) {
        clearAuthToken();
        window.location.href = "login.html";
        throw new Error("Session expired.");
    }

    return response;
}


/* =========================
   LOGOUT
========================= */

function adminLogout() {
    clearAuthToken();
    window.location.href = "login.html";
}
