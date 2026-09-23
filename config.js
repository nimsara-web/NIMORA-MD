/**
 * Project: NIMORA MD - Configuration Module
 * Creator: Nimsara
 * Website: https://nimsara-official.vercel.app/
 */

require('dotenv').config();

module.exports = {
    // ==========================================
    // 👑 OWNER CONFIGURATION
    // ==========================================
    ownerNumber: process.env.OWNER_NUMBER || '94784280074',
    ownerName: process.env.OWNER_NAME || 'Nimsara',
    mainOwnerNumbers: (process.env.MAIN_OWNER_NUMBERS || '94784280074,94701726411')
        .split(',')
        .map(n => n.trim().replace(/[^0-9]/g, '')),

    // ==========================================
    // 🤖 BOT BRANDING
    // ==========================================
    botName: process.env.BOT_NAME || 'NIMORA MD',
    botImageUrl: process.env.BOT_IMAGE_URL || 'https://raw.githubusercontent.com/nimsara-web/Im-Nim/refs/heads/main/Data/New/WhatsApp%20Image%202026-09-24%20at%201.11.32%20AM.jpeg',
    botAudioUrl: process.env.BOT_AUDIO_URL || 'https://github.com/nimsara-web/Im-Nim/raw/refs/heads/main/Nimoradata/0923.MP3',
    websiteLogoUrl: process.env.WEBSITE_LOGO_URL || 'https://raw.githubusercontent.com/nimsara-web/Im-Nim/refs/heads/main/Nimoradata/WhatsApp%20Image%202026-09-23%20at%201.57.30%20AM.jpeg',

    // ==========================================
    // 📢 WHATSAPP CHANNEL
    // ==========================================
    channelJid: process.env.CHANNEL_JID || '120363362308230584@newsletter',
    channelLink: process.env.CHANNEL_LINK || 'https://whatsapp.com/channel/0029Vb0bsRuFnSz4XAQ2yT0r',
    channelName: process.env.CHANNEL_NAME || 'NIMORA MD',

    // ==========================================
    // 🔑 API CONFIGURATION
    // ==========================================
    nimApiKey: process.env.NIM_API_KEY || 'zan_natXAWcy_8hpi5yn4b6',
    nimApiBase: process.env.NIM_API_BASE || 'https://api.zanta-mini.store',

    // ==========================================
    // 🌐 WEBSITE
    // ==========================================
    websiteUrl: process.env.WEBSITE_URL || 'https://nimsara-official.vercel.app/',
    supportNumber: process.env.SUPPORT_NUMBER || '94784280074',

    // ==========================================
    // ⚙️ BOT DEFAULTS
    // ==========================================
    defaultPrefix: process.env.DEFAULT_PREFIX || '.',
    defaultMode: process.env.DEFAULT_MODE || 'public',

    // ==========================================
    // 🎨 FOOTER
    // ==========================================
    footer: '\n\n> © ᴄʀᴇᴀᴛᴏʀ ʙY ɴɪᴍꜱᴀʀᴀ 🥷🏻',

    // ==========================================
    // 📁 PATHS
    // ==========================================
    sessionBasePath: './sessions',
    pluginBasePath: './plugins',

    // ==========================================
    // 🛡️ SAFETY LIMITS
    // ==========================================
    maxReconnectAttempts: 5,
    autoReplyWindow: 60000,      // 1 minute
    autoReplyMaxCount: 3,        // 3 replies per window
    getContactMaxSafe: 50,       // max messages per getcontact run
};
