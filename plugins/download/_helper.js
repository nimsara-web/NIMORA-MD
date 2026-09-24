/**
 * NIMORA MD - Download Helper
 * npm packages + API fallback
 */

const axios = require('axios');
const config = require('../../config');

const API_BASE = config.nimApiBase;
const API_KEY = config.nimApiKey;

// ==========================================
// 🌐 API FETCH (fallback)
// ==========================================
async function nimFetch(endpoint, params = {}, timeout = 45000) {
    const query = new URLSearchParams({ apiKey: API_KEY, ...params }).toString();
    const url = `${API_BASE}${endpoint}?${query}`;
    const res = await axios.get(url, { timeout });
    return res.data;
}

function extractUrl(data, paths = []) {
    if (!data) return null;
    for (const p of paths) {
        const val = p.split('.').reduce((o, k) => o?.[k], data);
        if (val && typeof val === 'string' && val.startsWith('http')) return val;
    }
    const common = ['url', 'download_url', 'downloadUrl', 'video', 'audio', 'hd', 'sd', 'link'];
    for (const key of common) {
        const val = data?.result?.[key] || data?.data?.[key] || data?.[key];
        if (val && typeof val === 'string' && val.startsWith('http')) return val;
    }
    return null;
}

async function tryApis(apis) {
    for (const api of apis) {
        try {
            const res = await axios.get(api.url, { timeout: api.timeout || 30000, responseType: api.responseType || 'json' });
            const result = api.extract ? api.extract(res.data) : res.data;
            if (result) {
                console.log(`✅ [DL] ${api.name || api.url.slice(0, 40)}`);
                return result;
            }
        } catch (e) {
            console.log(`❌ [DL] ${api.name || api.url.slice(0, 40)}: ${e.message}`);
        }
    }
    return null;
}

module.exports = { nimFetch, extractUrl, tryApis, API_BASE, API_KEY, config };
