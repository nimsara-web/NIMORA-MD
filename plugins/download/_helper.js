/**
 * NIMORA MD - Download Helper
 * Shared download utilities for all download plugins
 */

const axios = require('axios');
const config = require('../../config');

const API_BASE = config.nimApiBase;
const API_KEY = config.nimApiKey;

/**
 * Generic API fetch with NIM API
 */
async function nimFetch(endpoint, params = {}, timeout = 45000) {
    const query = new URLSearchParams({ apiKey: API_KEY, ...params }).toString();
    const url = `${API_BASE}${endpoint}?${query}`;
    const res = await axios.get(url, { timeout });
    return res.data;
}

/**
 * Extract URL from various API response shapes
 */
function extractUrl(data, paths = []) {
    if (!data) return null;
    for (const p of paths) {
        const val = p.split('.').reduce((o, k) => o?.[k], data);
        if (val && typeof val === 'string' && val.startsWith('http')) return val;
    }
    // Fallback: scan common keys
    const common = ['url', 'download_url', 'downloadUrl', 'video', 'audio', 'hd', 'sd', 'link'];
    for (const key of common) {
        const val = data?.result?.[key] || data?.data?.[key] || data?.[key];
        if (val && typeof val === 'string' && val.startsWith('http')) return val;
    }
    return null;
}

/**
 * Try multiple APIs in order
 */
async function tryApis(apis) {
    for (const api of apis) {
        try {
            const res = await axios.get(api.url, { timeout: api.timeout || 30000, responseType: api.responseType || 'json' });
            const result = api.extract ? api.extract(res.data) : res.data;
            if (result) {
                console.log(`✅ [DL] Success: ${api.name || api.url.slice(0, 40)}`);
                return result;
            }
        } catch (e) {
            console.log(`❌ [DL] Failed: ${api.name || api.url.slice(0, 40)} → ${e.message}`);
        }
    }
    return null;
}

module.exports = { nimFetch, extractUrl, tryApis, API_BASE, API_KEY, config };
